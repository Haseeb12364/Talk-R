# Enable real Google users and live chat

The app now uses Supabase Auth and Postgres Realtime. Each person must sign in at least once before they can be found in Talk R. Search people by their Google account email or display name. Users can also create workspaces, chat with workspace members, and invite people by email.

## 1. Create the database schema

Create a Supabase project, open **SQL Editor**, paste all of `supabase/schema.sql`, and run it. The schema creates profiles from Google sign-ins, direct conversations, messages, access policies, and the realtime publication.

## 2. Configure email invitations

Workspace invitations are sent by the Supabase Edge Function in `supabase/functions/invite-workspace-member`. Create a [Resend](https://resend.com/) account, verify a sending domain, and create an API key. In the Supabase Dashboard, open **Edge Functions → Secrets** and add:

```text
RESEND_API_KEY=<your Resend API key>
WORKSPACE_INVITE_FROM=Talk R <invites@your-verified-domain.com>
```

Deploy the function from the project folder:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase functions deploy invite-workspace-member
```

The invite email tells the recipient to sign in to Talk R with the invited Google account and accept under **People → Invitations**. Invitations expire after seven days.

## 3. Configure Google sign-in

In Google Cloud Console, create an OAuth client with type **Web application**. In Supabase, open **Authentication → Sign In / Providers → Google**, enable the provider, and enter that OAuth client ID and secret. Copy the callback URL shown by Supabase into the OAuth client's **Authorized redirect URIs**.

In **Supabase → Authentication → URL Configuration**, add this redirect URL:

```text
talkr://auth/callback
```

Keep the Google client secret in Supabase only. Do not put it in the app or an `EXPO_PUBLIC_` variable.

## 4. Add the app's public Supabase settings

Copy `.env.example` to `.env.local`. Replace the values with the **Project URL** and **Publishable key** from the Supabase project's Connect/API settings. The publishable key is intended for client apps; never use a `service_role` or secret key in the app.

For EAS builds, add both variables to the EAS **preview** environment (the current internal APK profile uses that environment). These are public client settings, so they can use plain-text visibility. Keep the Google OAuth client secret only in Supabase.

Restart Expo after changing `.env.local`:

```bash
npx expo start --clear
```

Google OAuth and secure session storage require a development or release build, not Expo Go. Rebuild and install the Android app after adding the configuration.

## How people use Talk R

Each person signs in with Google. In **People**, create a workspace and send an invitation to an email address. The recipient must sign in with that same Google account, then accept the invitation. Open the workspace to chat with all its members. To start a direct chat, search for a person by name or email and tap the result. Messages are saved in Supabase and delivered to signed-in members through Realtime.
