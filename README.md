<p align="center">
	<img src="public/stagio_logo_1.png" width="180" alt="Stagio logo" />
</p>

# Stagio

Stagio is a career readiness platform that helps students and early-career professionals build a stronger profile, prepare for interviews, and discover opportunities.

## Features

- CV rewriting and document feedback
- Job matching and role discovery
- Portfolio builder and profile management
- Virtual interviewer with audio and scoring
Stagio is a career readiness platform that helps students and early-career professionals build stronger profiles, prepare for interviews, and discover opportunities.

## What is included

- Career guide and onboarding flows
- CV rewriter and CV database/detail views
- Job matcher and role discovery
- Portfolio builder with saved projects and detail views
- Virtual interviewer: setup, live room, and scoring
- Profile completion, info, and security settings
- Auth flows: login, signup, and password reset
- Dashboard and services navigation

## Tech stack

### Frontend

- Next.js (App Router), React 19, TypeScript
- Tailwind CSS, Radix UI, shadcn-style components
- React Hook Form + Zod validation
- TanStack Query, Zustand
- Supabase auth helpers

### Backend

- NestJS, TypeScript
- Prisma ORM with PostgreSQL
- JWT auth (Passport)
- Socket.IO for realtime interview flows
- Multer + PDF tooling for CV processing
- Groq (transcription + LLM) and ElevenLabs (TTS)

## Project structure

- `app/`: Next.js App Router routes
- `src/`: shared UI, features, hooks, and utilities
- `backend/`: NestJS API and database layer
- `frontend/`: secondary Next.js workspace and UI experiments

## Getting started

### Prerequisites

- Node.js 18+ (20 recommended)
- PostgreSQL 14+

### 1) Install dependencies

```bash
npm install
cd backend
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` at the repo root and fill in values. If you only need the backend, you can place a `.env` file in `backend/` instead.

### 3) Run in dev

```bash
npm run dev
# app at http://localhost:5173

cd backend
npm run start:dev
# API at http://localhost:3000
```

## Scripts

### Frontend (repo root)

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Backend (backend/)

```bash
npm run start:dev
npm run build
npm run start:prod
npm run test
```

## Environment variables

The main values are listed in `.env.example`. You will typically set:

- `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_API_URL_WS`
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` and `NEXT_PUBLIC_SUPABASE_PASSWORD_RESET_REDIRECT_URL`
- `DB_URL` and `PORT`
- `JWT_SECRET` and `JWT_EXPIRATION_TIME`
- `GROQ_API_KEY`, `GROQ_WHISPER_MODEL`, `GROQ_LLM_MODEL`
- `ELEVEN_LABS_API_KEY` and `ELEVEN_LABS_TTS_MODEL`

### Optional local auth bypass

For frontend-only local work, you can skip JWT auth on protected routes in development:

```bash
NODE_ENV=development
DEV_AUTH_BYPASS=true
```

You can optionally set a specific user selector:

```bash
DEV_AUTH_BYPASS_USER_ID=your-user-uuid
# or
DEV_AUTH_BYPASS_USER_EMAIL=you@example.com
# or
DEV_AUTH_BYPASS_USER_USERNAME=your.username
```
