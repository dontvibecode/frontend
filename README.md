# dontvibecode — frontend

Next.js (App Router) client for [dontvibecode](https://dontvibecode.com). Renders a two-stage LLM turn as it streams over SSE, plays back AI narration with read-along highlighting synchronized to a markdown/KaTeX renderer shared line-for-line with the backend, and drives Stripe subscriptions and Google Sign-In.

See [`API.md`](./API.md) for the full endpoint reference this client talks to.

## Stack

Next.js 15 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4 · NextAuth (Google) · Stripe Elements · KaTeX · a hand-rolled markdown renderer (see below).

## Architecture

```
src/
  app/
    chat/            the whole product surface: page.tsx (state, SSE), lesson.tsx (lesson panel)
    components/       SpeechProvider (narration), PaymentModal, UserProfilePopup, ...
    api/auth/         NextAuth route (Google ID token exchange)
  lib/
    api.ts            typed fetch wrappers; camelCase↔snake_case boundary with the backend
    markdownParser.tsx hand-rolled markdown + KaTeX renderer, tags every block with a line number
    speech.ts          pure helpers for the narration player (no React)
  types/api.ts         the wire-format contract with the backend, one interface per payload
```

`api.ts` is the only file that calls `fetch`. Every backend response's snake_case gets translated to camelCase at that one boundary, so nowhere else in the codebase has to remember which convention a given field uses.

### Streaming a two-stage turn

A message triggers a Django endpoint that internally runs a fast **router** model and, only when needed, a slower **instructor** model that writes a full lesson — see the backend README for why that split exists. Both stages' "thinking" text and the final payload arrive as one Server-Sent-Events stream; `messageAPI.sendMessageStreaming` (`lib/api.ts`) parses it incrementally so the UI can show live progress (`StreamingThoughts`) through what would otherwise be several seconds of a blank spinner, and resolves once with the finished message.

### Narration: one controller, refs over state, and a highlighting contract with the backend

`SpeechProvider` owns a single `<audio>` element for the whole page and exposes it through `useSpeechController`. Two decisions matter here:

- **Refs, not state, for anything that changes on every audio frame.** Playback position fires ~4 times a second; storing that in React state would re-render a whole lesson panel on every tick. Position, marks, and engine state live in refs — only coarse transitions (`idle → loading → playing → paused`) go through `useState`. The mini-player subscribes to position via `subscribeToProgress`, so its progress bar re-renders on its own without touching anything else.
- **Read-along highlighting is a line-number contract with `speech_text.py`.** `markdownParser.tsx` tags every rendered block (`data-speech-line="7"`) as it walks a message's markdown; the backend's `speech_text.py` walks the *same* markdown with the *same* line-counting rules to build the text ElevenLabs actually speaks, and ElevenLabs returns per-character timing for that text. `activeMarkIndex` + `findSpeechTargets` (`lib/speech.ts`) turn "audio is at 12.3s" into "highlight `data-speech-line="7"` inside message 42's `explanation` field" — in every place that message is currently rendered (a chat bubble and the lesson panel can both be on screen at once). Both files carry a comment pointing at the other, because a change to one silently breaks highlighting without breaking anything a type checker would catch.

When the backend can't produce premium audio (no API key, an exhausted allowance, ElevenLabs erroring), it returns the same prepared text instead of an error, and the player falls back to the browser's own `speechSynthesis` — narration degrades instead of disappearing. It also unlocks audio playback during the *send* click (`speech.unlock()`), because some browsers only allow audio to start outside a user gesture if that same `<audio>` element already played during one — necessary since a lesson can take several seconds to generate, by which point the original click no longer counts.

### Markdown + KaTeX, not a library

`markdownParser.tsx` is a small hand-rolled renderer rather than `react-markdown`, specifically so it can (a) tag every block with the line number the narration contract above depends on, and (b) special-case TeX math (`$...$`, `$$...$$`) to render via KaTeX while staying out of the way of things that merely *look* like math syntax — a price like `$5` is deliberately never treated as an equation.

## Local development

```bash
pnpm install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL, Google OAuth + NEXTAUTH_SECRET, Stripe publishable key
pnpm dev
```

Runs against a deployed backend by default; point `NEXT_PUBLIC_API_URL` at `http://127.0.0.1:8000/` to use one running locally instead.

## Checks

```bash
pnpm exec tsc --noEmit   # type check
pnpm lint                # eslint
pnpm build               # production build — also type-checks and prerenders static routes
```

There's no frontend unit-test runner configured; the narration player's pure logic (`lib/speech.ts`) is deliberately framework-free so it's straightforward to add one.

## Deployment

Builds as a static/hybrid Next.js app; the current deployment target is Cloudflare Workers via OpenNext (`x-opennext` response header), with Vercel as the zero-config alternative if that's ever simpler. `NEXT_PUBLIC_*` env vars are baked in at build time — a value changed only in the host's dashboard requires a rebuild, not just a restart, to take effect.
