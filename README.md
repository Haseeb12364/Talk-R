# Talk R

A mobile-first chat app UI built with React Native and Expo. The inbox includes online contacts, recent conversations, unread counts, search, and a four-item tab bar.

## Start the app

```bash
npm install
npm run start
```

Then open the project in an Android emulator or a development build. Use `npm run ios` on macOS, or `npm run web` to launch the web version. For Expo Go on a physical device, Expo currently recommends SDK 57 during its SDK 58 transition.

## Code checks

```bash
npm run lint
npx tsc --noEmit
```

## Project structure

```text
src/
  app/                   Expo Router routes and layouts
  screens/chat/          Inbox and conversation screens
  components/            Reusable app-wide UI
  features/chat/
    components/           Inbox, conversation, and message UI
    data/                  Conversation and message fixtures
    types.ts               Chat domain types
  theme/                   Shared design tokens
```

`src/app/index.tsx` maps the home route to `ChatScreen`; `src/app/conversation/[id].tsx` maps a chat to `ConversationScreen`. Keep route definitions in `app/`, screen-level composition in `screens/`, and reusable or feature-specific UI in their respective component folders. Conversation messages are sample data and newly sent messages remain local to the screen.
