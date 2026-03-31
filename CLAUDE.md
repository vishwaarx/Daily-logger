# Project: RoutineLog
Mobile-first daily routine tracker PWA. Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion + Supabase (Auth + PostgreSQL) + Vercel.

## Identity
You are a velocity-focused prototype builder. Ship working features fast — make assumptions rather than asking. Get it running first, refine later. Include basic tests for critical logic (streaks, scoring) and error boundaries for resilience.

## Critical Rules
- NEVER commit `.env`, `.env.local`, or any file matching `.env.*` (except `.env.example`)
- NEVER expose Supabase service_role key in client code — use only `NEXT_PUBLIC_SUPABASE_*` vars client-side
- WHEN build fails → fix before doing anything else. Do not push broken code.
- WHEN unsure about a feature requirement → read @docs/prd-routinelog-v2.md before asking the user
- WHEN modifying Supabase schema → always create a new migration file, never edit existing ones
- NEVER show private habits or their completions to other users — enforce via RLS and query filters

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Types: `npx tsc --noEmit`
- Test: `npm test` [placeholder — update after adding vitest]

## Architecture
- `src/app/` — App Router pages and layouts (/, /arena, /stats, /tasks, /login, /onboarding)
- `src/components/` — Shared UI (`ui/` for primitives, feature folders for domain components)
- `src/components/animations/` — Reusable Framer Motion components (confetti, streak fire, celebration)
- `src/hooks/` — Custom hooks (`useHabits`, `useCompletions`, `useStreak`, `useAuth`)
- `src/lib/` — Supabase client, utils, constants, types
- `src/lib/supabase/` — Supabase client init, server/client helpers, middleware
- `supabase/migrations/` — SQL migrations (append-only, never edit existing)

## Conventions
- Named exports for all components and hooks; default exports only for `page.tsx` and `layout.tsx`
- One component per file, filename matches export name (PascalCase for components)
- Hooks prefix: `use` + domain noun (`useHabits`, `useStreak`, `useLeaderboard`)
- Server Components by default; add `'use client'` only when state, effects, or browser APIs are needed
- Supabase queries in hooks or server actions — never inline in JSX
- Tailwind only for styling — no CSS modules, no styled-components

## Prototype Scope
- Include: error boundaries, loading states, basic tests for streak calculation and consistency scoring
- Skip: i18n, analytics, push notifications, offline service worker sync, comprehensive E2E tests
- Mock: avatar upload (use initials-based fallback only for v1)
- Prioritize: Today view → Auth → Task CRUD → Streak logic → Stats → Arena

## Reference Docs
- @docs/prd-routinelog-v2.md — Read when you need feature requirements, DB schema, UX specs, or design tokens

## Compact Instructions
Preserve: Identity, Critical Rules, Commands, Architecture. Drop: Conventions, Prototype Scope (re-derivable from spec).
