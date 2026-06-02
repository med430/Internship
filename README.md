<p align="center">
  <img src="public/stagio-logo-blue.png" width="180" alt="Stagio" />
</p>

<h1 align="center">Stagio — AI-Powered Career Readiness Platform</h1>

<p align="center">
  A full-stack SaaS platform that helps students prepare for the job market —<br/>
  from AI-generated documents to real-time voice interviews and personalised job matching.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-11.1-E0234E?logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma_7-2D3748?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/ML-BGE--M3_%2B_Qdrant-6C2BD9" alt="ML" />
  <img src="https://img.shields.io/badge/AI-Groq_llama--3.3--70b-orange" alt="Groq" />
  <img src="https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe" alt="Stripe" />
</p>

---

## What is Stagio?

Stagio is a career readiness platform targeting three user roles — **students**, **recruiters**, and **admins** — built around a NestJS backend, a Next.js frontend, and a Python ML sidecar for semantic job recommendations.

---

## Core Features

### AI-Powered Tools

| Feature | Description |
|---|---|
| **Virtual Interview Simulator** | Real-time voice interview with an AI persona (Empathic / Technical / Direct). The student speaks, Groq Whisper transcribes in real time, ElevenLabs synthesises the interviewer's voice, and the LLM scores answers with structured feedback at the end of the session. |
| **CV Rewriter** | Upload a PDF CV alongside a job description — the LLM rewrites and tailors the CV to the offer, with inline suggestions the student can accept or edit. |
| **Cover Letter Generator** | Generates a personalised cover letter from the student profile and targeted offer. |
| **Document Generator** | One-shot AI generation of both a tailored CV and cover letter as downloadable PDFs, stored directly to the student's document library. |
| **Career Guide** | AI-generated personalised roadmap: skills gap analysis, project recommendations, and soft-skill development plan based on the student's profile. |
| **Portfolio Builder** | Generates a professional HTML/CSS portfolio from profile data with multiple layout themes and a shareable link. |

### Job Matching & Applications

| Feature | Description |
|---|---|
| **Job Matcher** | Three-signal recommendation engine: content similarity (skills, domain, work mode) + semantic scoring via BGE-M3 dense vector embeddings (Qdrant) + collaborative filtering signals. |
| **Application Tracker** | Apply to offers with CV + cover letter selection, track status through the full pipeline (Submitted → In Review → Accepted / Rejected). |
| **Interview Scheduling** | Recruiters propose slots, students accept or decline — calendar view with automatic email confirmations via Brevo. |

### Platform & Communication

| Feature | Description |
|---|---|
| **Real-time Chat** | WebSocket-based direct messaging between students and recruiters, persisted in MongoDB. |
| **Live Notifications** | Server-Sent Events push updates for application status changes, new messages, and recommendation refreshes. |
| **Recruiter Portal** | Full offer management, applicant pipeline, student discovery, analytics dashboard, and messaging. |
| **Admin Dashboard** | User and offer moderation, application monitoring, manual recommendation recomputation. |
| **Subscription** | Free tier and Stripe-billed premium plan with feature gating. |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│            Next.js 16 — App Router + React 19         │
└─────────────────────┬────────────────────────────────┘
                      │  REST · GraphQL · WebSocket · SSE
┌─────────────────────▼────────────────────────────────┐
│          NestJS 11 — CQRS · 29 controllers            │
│       JWT + Supabase · Prisma · Socket.io · Stripe    │
└────────────────┬───────────────────────┬─────────────┘
                 │                       │ HTTP (internal)
    ┌────────────▼──────────┐  ┌─────────▼──────────────┐
    │  PostgreSQL (Neon)    │  │  Python ML Sidecar      │
    │  MongoDB Atlas (chat) │  │  FastAPI · BGE-M3       │
    └───────────────────────┘  │  Qdrant vector DB       │
                               │  APScheduler sync worker│
                               └────────────────────────┘
```

The backend follows a strict **CQRS** architecture (47+ commands, 40+ queries). The Python sidecar runs independently — it embeds students and offers into Qdrant using BGE-M3 (1024-dim vectors) and serves cosine similarity scores to the NestJS scoring service.

---

## Tech Stack

**Frontend** — Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Zustand, TanStack Query, Socket.io-client, FullCalendar, Supabase Auth

**Backend** — NestJS 11, TypeScript, Prisma 7, PostgreSQL (Neon), MongoDB (Atlas), Apollo/GraphQL, Socket.io, Stripe, Cloudinary, Brevo

**ML Sidecar** — Python 3.13, FastAPI, BGE-M3 (FlagEmbedding), Qdrant, APScheduler, asyncpg

**AI Services** — Groq `llama-3.3-70b-versatile` (LLM) · Groq `whisper-large-v3` (speech-to-text) · ElevenLabs `eleven_multilingual_v2` (TTS)

---

## Getting Started

### Prerequisites

- Node.js 20+, PostgreSQL 14+, MongoDB Atlas, Docker (for the ML sidecar)

### Run locally

```bash
# Install dependencies
npm install && cd backend && npm install

# Configure environment
cp .env.example .env  # fill in all values

# Apply database migrations
cd backend && npx prisma migrate deploy

# Start frontend (http://localhost:5173) and backend (http://localhost:3000)
npm run dev
cd backend && npm run start:dev
```

### Run with the full ML stack

```bash
# Start Qdrant + ML inference server + embedding sync worker
docker compose up -d --build

# Set ML_MOCK=false and ML_SERVICE_URL=http://localhost:8000 in .env
```

> Without Docker, set `ML_MOCK=true` — the backend falls back to content-only scoring.

---

## Key Numbers

| Metric | Value |
|---|---|
| Prisma models | 31 |
| REST controllers | 29 |
| GraphQL resolvers | 14 |
| CQRS handlers | 87+ |
| Frontend pages | 40+ |
| UI components | 50+ |

---

<p align="center">
  Built with Next.js · NestJS · FastAPI · BGE-M3 · Qdrant · Groq · ElevenLabs · Stripe
</p>
