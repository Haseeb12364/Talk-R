import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' });

  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('WORKSPACE_INVITE_FROM');

  if (!authorization) return json(401, { error: 'Sign in before sending an invitation.' });
  if (!supabaseUrl || !anonKey) return json(500, { error: 'The Supabase Edge Function is not configured.' });
  if (!resendApiKey || !fromEmail) return json(503, { error: 'Workspace invitation email is not configured yet.' });

  let payload: { workspaceId?: string; email?: string };
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: 'Invalid request body.' });
  }

  const workspaceId = payload.workspaceId?.trim();
  const email = payload.email?.trim().toLowerCase();
  if (!workspaceId || !email) return json(400, { error: 'Workspace and email are required.' });

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authorization } },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return json(401, { error: 'Your session expired. Sign in again.' });

  const { data: inviteRows, error: inviteError } = await supabase.rpc('create_workspace_invite', {
    target_workspace: workspaceId,
    invite_email: email,
  });
  if (inviteError) return json(400, { error: inviteError.message });

  const invite = inviteRows?.[0] as { invite_id: string; workspace_name: string; inviter_name: string } | undefined;
  if (!invite) return json(500, { error: 'Could not create the workspace invitation.' });

  const workspaceName = escapeHtml(invite.workspace_name);
  const inviterName = escapeHtml(invite.inviter_name);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: `${invite.inviter_name} invited you to ${invite.workspace_name} on Talk R`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:32px auto;color:#252923"><h1 style="color:#315b45">You’re invited to Talk R</h1><p><strong>${inviterName}</strong> invited you to join <strong>${workspaceName}</strong>.</p><p>Install or open Talk R, sign in with <strong>${escapeHtml(email)}</strong> using Google, then accept the invitation in the People tab.</p><p style="color:#73766f">This invitation expires in 7 days.</p></div>`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error('Resend invitation failed:', details);
    return json(502, { error: 'The invitation could not be emailed. Check the Resend sender configuration and try again.' });
  }

  return json(200, { inviteId: invite.invite_id });
});
