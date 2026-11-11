-- Run once in Supabase Dashboard → SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null default 'Talk R user',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  is_group boolean not null default false,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  conversation_id uuid not null unique references public.conversations(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'cancelled')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists conversation_members_user_idx on public.conversation_members(user_id, conversation_id);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at desc);
create index if not exists workspace_members_user_idx on public.workspace_members(user_id, workspace_id);
create unique index if not exists workspace_invites_pending_email_idx
  on public.workspace_invites (workspace_id, lower(email)) where status = 'pending';

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'Talk R user'), '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (user_id) do update set
    email = excluded.email,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_talkr on auth.users;
create trigger on_auth_user_created_talkr
  after insert or update on auth.users
  for each row execute function public.create_profile_for_auth_user();

create or replace function public.is_conversation_member(target_conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = target_conversation
      and cm.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = (select auth.uid())
  );
$$;

create or replace function public.create_workspace(workspace_name text)
returns table (workspace_id uuid, conversation_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  clean_name text := trim(coalesce(workspace_name, ''));
  new_conversation uuid;
  new_workspace uuid;
begin
  if current_user_id is null then
    raise exception 'You must sign in first.' using errcode = '28000';
  end if;
  if char_length(clean_name) < 2 or char_length(clean_name) > 60 then
    raise exception 'Workspace names must be between 2 and 60 characters.' using errcode = '22023';
  end if;

  insert into public.conversations (title, is_group, created_by)
    values (clean_name, true, current_user_id)
    returning id into new_conversation;
  insert into public.workspaces (name, conversation_id, created_by)
    values (clean_name, new_conversation, current_user_id)
    returning id into new_workspace;
  insert into public.workspace_members (workspace_id, user_id, role)
    values (new_workspace, current_user_id, 'owner');
  insert into public.conversation_members (conversation_id, user_id)
    values (new_conversation, current_user_id);

  return query select new_workspace, new_conversation;
end;
$$;

create or replace function public.get_my_workspaces()
returns table (
  id uuid,
  name text,
  conversation_id uuid,
  member_count bigint,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select w.id, w.name, w.conversation_id, count(wm.user_id) as member_count, w.created_at
  from public.workspace_members mine
  join public.workspaces w on w.id = mine.workspace_id
  join public.workspace_members wm on wm.workspace_id = w.id
  where mine.user_id = auth.uid()
  group by w.id
  order by w.created_at desc;
$$;

create or replace function public.list_workspace_invites()
returns table (
  id uuid,
  workspace_id uuid,
  workspace_name text,
  inviter_name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, i.workspace_id, w.name, p.display_name, i.created_at
  from public.workspace_invites i
  join public.workspaces w on w.id = i.workspace_id
  left join public.profiles p on p.user_id = i.invited_by
  where lower(i.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and i.status = 'pending'
    and i.expires_at > now()
  order by i.created_at desc;
$$;

create or replace function public.create_workspace_invite(target_workspace uuid, invite_email text)
returns table (invite_id uuid, workspace_name text, inviter_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  clean_email text := lower(trim(coalesce(invite_email, '')));
  current_workspace_name text;
  current_inviter_name text;
  new_invite_id uuid;
begin
  if current_user_id is null then
    raise exception 'You must sign in first.' using errcode = '28000';
  end if;
  if clean_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = current_user_id
      and wm.role in ('owner', 'admin')
  ) then
    raise exception 'Only workspace owners and admins can invite members.' using errcode = '42501';
  end if;
  if clean_email = lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'You are already in this workspace.' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.profiles p
    join public.workspace_members wm on wm.user_id = p.user_id
    where wm.workspace_id = target_workspace and lower(p.email) = clean_email
  ) then
    raise exception 'That person is already a workspace member.' using errcode = '23505';
  end if;

  select w.name into current_workspace_name from public.workspaces w where w.id = target_workspace;
  if current_workspace_name is null then
    raise exception 'Workspace not found.' using errcode = '22023';
  end if;
  select p.display_name into current_inviter_name from public.profiles p where p.user_id = current_user_id;

  insert into public.workspace_invites (workspace_id, email, invited_by, status, created_at, expires_at)
    values (target_workspace, clean_email, current_user_id, 'pending', now(), now() + interval '7 days')
    on conflict (workspace_id, lower(email)) where status = 'pending'
    do update set invited_by = excluded.invited_by, created_at = now(), expires_at = now() + interval '7 days'
    returning id into new_invite_id;

  return query select new_invite_id, current_workspace_name, coalesce(current_inviter_name, 'A Talk R user');
end;
$$;

create or replace function public.accept_workspace_invite(target_invite uuid)
returns table (workspace_id uuid, conversation_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  target_workspace uuid;
  target_conversation uuid;
begin
  if current_user_id is null or current_email = '' then
    raise exception 'Sign in with the invited Google account first.' using errcode = '28000';
  end if;

  select i.workspace_id, w.conversation_id into target_workspace, target_conversation
  from public.workspace_invites i
  join public.workspaces w on w.id = i.workspace_id
  where i.id = target_invite
    and lower(i.email) = current_email
    and i.status = 'pending'
    and i.expires_at > now()
  for update of i;

  if target_workspace is null then
    raise exception 'Invitation not found, expired, or addressed to another Google account.' using errcode = '22023';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
    values (target_workspace, current_user_id, 'member')
    on conflict (workspace_id, user_id) do nothing;
  insert into public.conversation_members (conversation_id, user_id)
    values (target_conversation, current_user_id)
    on conflict (conversation_id, user_id) do nothing;
  update public.workspace_invites set status = 'accepted', accepted_at = now() where id = target_invite;

  return query select target_workspace, target_conversation;
end;
$$;

create or replace function public.get_workspace_members(target_workspace uuid)
returns table (user_id uuid, email text, display_name text, avatar_url text, role text, joined_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.user_id, p.email, p.display_name, p.avatar_url, wm.role, wm.joined_at
  from public.workspace_members wm
  join public.profiles p on p.user_id = wm.user_id
  where wm.workspace_id = target_workspace
    and public.is_workspace_member(target_workspace)
  order by case wm.role when 'owner' then 0 when 'admin' then 1 else 2 end, p.display_name;
$$;

create or replace function public.search_users(search_term text)
returns table (user_id uuid, email text, display_name text, avatar_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.user_id, p.email, p.display_name, p.avatar_url
  from public.profiles p
  where auth.uid() is not null
    and p.user_id <> auth.uid()
    and length(trim(coalesce(search_term, ''))) >= 2
    and (lower(p.email) = lower(trim(search_term))
      or p.display_name ilike trim(search_term) || '%')
  order by p.display_name
  limit 30;
$$;

create or replace function public.open_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  found_conversation uuid;
begin
  if current_user_id is null then
    raise exception 'You must sign in first.' using errcode = '28000';
  end if;
  if other_user_id is null or other_user_id = current_user_id then
    raise exception 'Choose another user to start a conversation.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles p where p.user_id = other_user_id) then
    raise exception 'That user does not exist.' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    least(current_user_id::text, other_user_id::text) || ':' || greatest(current_user_id::text, other_user_id::text), 0
  ));

  select cm.conversation_id into found_conversation
  from public.conversation_members cm
  join public.conversations c on c.id = cm.conversation_id
  where c.is_group = false
    and cm.user_id in (current_user_id, other_user_id)
  group by cm.conversation_id
  having count(distinct cm.user_id) = 2
    and count(*) = 2;

  if found_conversation is null then
    insert into public.conversations (created_by) values (current_user_id)
      returning id into found_conversation;
    insert into public.conversation_members (conversation_id, user_id)
      values (found_conversation, current_user_id), (found_conversation, other_user_id);
  end if;

  return found_conversation;
end;
$$;

create or replace function public.get_my_conversations()
returns table (
  id uuid,
  title text,
  is_group boolean,
  peer_id uuid,
  peer_email text,
  peer_name text,
  peer_avatar_url text,
  last_message text,
  last_message_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id,
    coalesce(c.title, p.display_name, 'Conversation') as title,
    c.is_group,
    p.user_id as peer_id,
    p.email as peer_email,
    p.display_name as peer_name,
    p.avatar_url as peer_avatar_url,
    latest.body as last_message,
    latest.created_at as last_message_at
  from public.conversation_members mine
  join public.conversations c on c.id = mine.conversation_id
  left join lateral (
    select cm.user_id from public.conversation_members cm
    where cm.conversation_id = c.id and cm.user_id <> auth.uid()
    order by cm.joined_at limit 1
  ) peer on true
  left join public.profiles p on p.user_id = peer.user_id
  left join lateral (
    select m.body, m.created_at from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc limit 1
  ) latest on true
  where mine.user_id = auth.uid()
  order by coalesce(latest.created_at, c.created_at) desc;
$$;

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Members read conversations" on public.conversations;
create policy "Members read conversations" on public.conversations
  for select to authenticated using (public.is_conversation_member(id));
drop policy if exists "Members read membership" on public.conversation_members;
create policy "Members read membership" on public.conversation_members
  for select to authenticated using (public.is_conversation_member(conversation_id));
drop policy if exists "Members read messages" on public.messages;
create policy "Members read messages" on public.messages
  for select to authenticated using (public.is_conversation_member(conversation_id));
drop policy if exists "Members send messages as themselves" on public.messages;
create policy "Members send messages as themselves" on public.messages
  for insert to authenticated with check (
    sender_id = (select auth.uid()) and public.is_conversation_member(conversation_id)
  );
drop policy if exists "Workspace members read workspaces" on public.workspaces;
create policy "Workspace members read workspaces" on public.workspaces
  for select to authenticated using (public.is_workspace_member(id));
drop policy if exists "Workspace members read membership" on public.workspace_members;
create policy "Workspace members read membership" on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id));
drop policy if exists "Members and invitees read workspace invites" on public.workspace_invites;
create policy "Members and invitees read workspace invites" on public.workspace_invites
  for select to authenticated using (
    public.is_workspace_member(workspace_id)
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

revoke all on public.profiles, public.conversations, public.conversation_members, public.messages,
  public.workspaces, public.workspace_members, public.workspace_invites from anon, authenticated;
grant select on public.profiles, public.conversations, public.conversation_members,
  public.workspaces, public.workspace_members, public.workspace_invites to authenticated;
grant select, insert on public.messages to authenticated;

revoke all on function public.search_users(text) from public, anon;
revoke all on function public.open_direct_conversation(uuid) from public, anon;
revoke all on function public.get_my_conversations() from public, anon;
revoke all on function public.is_conversation_member(uuid) from public, anon;
revoke all on function public.is_workspace_member(uuid) from public, anon;
revoke all on function public.create_workspace(text) from public, anon;
revoke all on function public.get_my_workspaces() from public, anon;
revoke all on function public.list_workspace_invites() from public, anon;
revoke all on function public.create_workspace_invite(uuid, text) from public, anon;
revoke all on function public.accept_workspace_invite(uuid) from public, anon;
revoke all on function public.get_workspace_members(uuid) from public, anon;
grant execute on function public.search_users(text) to authenticated;
grant execute on function public.open_direct_conversation(uuid) to authenticated;
grant execute on function public.get_my_conversations() to authenticated;
grant execute on function public.is_conversation_member(uuid) to authenticated;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.create_workspace(text) to authenticated;
grant execute on function public.get_my_workspaces() to authenticated;
grant execute on function public.list_workspace_invites() to authenticated;
grant execute on function public.create_workspace_invite(uuid, text) to authenticated;
grant execute on function public.accept_workspace_invite(uuid) to authenticated;
grant execute on function public.get_workspace_members(uuid) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;
