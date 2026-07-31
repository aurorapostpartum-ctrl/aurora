# CodeBook Canada Pro

A premium, dark-mode-only enterprise mobile app built with Expo Router, TypeScript, Reanimated, React Query, and Supabase authentication.

## Design language

- Minimal, Apple-quality UI
- Dark mode only — black background (`#0B0B0D`), white typography, blue accent (`#2F80FF`)
- Glassmorphism cards with blur, soft shadows, and 18–24px rounded corners
- Native iOS-feeling motion via Reanimated, with haptic feedback throughout

## Stack

- **Expo Router** (file-based navigation, typed routes, web + tablet support)
- **TypeScript** (strict mode)
- **React Native Reanimated 4** for premium micro-animations
- **TanStack React Query** for async data with built-in loading/error handling
- **Supabase** for authentication (email/password, session persistence)

## Getting started

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL and anon key
npm run start           # or: npm run ios / npm run android / npm run web
```

## Project structure

```
app/                    Expo Router routes
  _layout.tsx            Root layout — providers, auth-guarded navigator
  (auth)/                 Sign in, sign up, forgot password
  (app)/                  Signed-in tab flow — dashboard, settings

src/
  theme/                  Design tokens: colors, typography, spacing, motion
  components/ui/          Reusable primitives: Button, TextField, GlassCard,
                           Skeleton, EmptyState, ErrorState, Screen, etc.
  providers/               AuthProvider (Supabase session), AppProviders
  lib/                     Supabase client, React Query client, validation
  features/dashboard/      Dashboard-specific data hooks and components
```

## Screens shipped so far

- **Sign In / Sign Up / Forgot Password** — full validation, loading and
  error states, haptic feedback, animated entrances
- **Dashboard** — stats, recent projects list with skeleton loading, empty
  state, error state with retry, and pull-to-refresh, backed by React Query
- **Settings** — profile card, account section, sign out flow

More screens (Projects, Activity, notification detail views, etc.) are the
natural next increment.
