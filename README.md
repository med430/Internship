<p align="center">
  <img src="public/stagio-logo-blue.png" width="180" alt="Stagio" />
</p>

<h1 align="center">Stagio — AI-Powered Career Readiness Platform</h1>

<p align="center">
  A full-stack SaaS platform that helps students prepare for the job market —<br/>
  from AI-generated documents to multimodal voice + facial interviews and personalised job matching.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-11.1-E0234E?logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma_7-2D3748?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/ML-BGE--M3_%2B_Qdrant-6C2BD9" alt="ML" />
  <img src="https://img.shields.io/badge/AI-Groq_llama--3.3--70b-orange" alt="Groq" />
  <img src="https://img.shields.io/badge/Vision-MediaPipe_Face_Landmarker-00BCD4" alt="MediaPipe" />
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
| **Virtual Interview Simulator** | Multimodal real-time interview combining **voice** and **facial expression analysis**. The student speaks; Groq Whisper transcribes in real time, an LLM generates the next question, and ElevenLabs synthesises the interviewer's voice (Empathic / Technical / Direct persona). Simultaneously, **MediaPipe Face Landmarker** analyses the webcam stream client-side at 400 ms intervals — computing 10 facial metrics (attention rate, smile rate, expression stability, eye openness, brow tension…) from 52 blendshapes. At session close, a weighted coaching score (0–100) and a human-readable summary are appended to the PDF report. No video is ever stored — only aggregated metrics. |
| **CV Rewriter** | Upload a PDF CV alongside a job description — the LLM rewrites and tailors the CV to the offer, with inline suggestions the student can accept or edit. |
| **Cover Letter Generator** | Generates a personalised cover letter from the student profile and targeted offer. |
| **Document Generator** | One-shot AI generation of both a tailored CV and cover letter as downloadable PDFs, stored directly to the student's document library. |
| **Career Guide** | AI-generated personalised roadmap: skills gap analysis, project recommendations, and soft-skill development plan based on the student's profile. |
| **Portfolio Builder** | Generates a professional HTML/CSS portfolio from profile data with multiple layout themes and a shareable link. |

### Job Matching & Applications

| Feature | Description |
|---|---|
| **Job Matcher** | Hybrid recommendation engine: deterministic content scoring (skills, domain, location, work mode) + semantic matching via BGE-M3 multilingual embeddings (Qdrant ANN) + collaborative-filtering signals (LightFM / ALS), merged with Reciprocal Rank Fusion, diversified via MMR re-ranking, and re-scored in real time by freshness, deadline-urgency, and bookmark signals. |
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

The backend follows a strict **CQRS** architecture (47+ commands, 40+ queries). The Python sidecar runs independently: an APScheduler worker continuously embeds students and offers into Qdrant with BGE-M3 (1024-dim vectors), and a multi-stage pipeline runs semantic ANN retrieval, fuses it with content and collaborative-filtering candidates via Reciprocal Rank Fusion, blends the signals, and applies MMR diversity re-ranking before returning ranked scores to the NestJS scoring service. A nightly cron recomputes and persists every active student's feed, falling back to content-only scoring whenever the sidecar is unavailable.

---

## Tech Stack

**Frontend** — Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Zustand, TanStack Query, Socket.io-client, FullCalendar, Supabase Auth, **MediaPipe Face Landmarker** (client-side, WASM/WebGL)

**Backend** — NestJS 11, TypeScript, Prisma 7, PostgreSQL (Neon), MongoDB (Atlas), Apollo/GraphQL, Socket.io, Stripe, Cloudinary, Brevo

**ML Sidecar** — Python 3.13, FastAPI, BGE-M3 (FlagEmbedding), Qdrant, APScheduler, asyncpg

**AI Services** — Groq `llama-3.3-70b-versatile` (LLM) · Groq `whisper-large-v3` (STT) · ElevenLabs `eleven_multilingual_v2` (TTS) · MediaPipe `face_landmarker` float16 (facial blendshapes)

---

## Facial Expression Coaching (Interview Simulator)

The interview simulator uses **MediaPipe Face Landmarker** (loaded from CDN, runs entirely in the browser via WebAssembly + WebGL) to provide non-evaluative facial communication coaching alongside voice analysis.

### How it works

**Step 1 — Model loading** · On interview start, the MediaPipe float16 model loads (~1–2 s). GPU (WebGL) is attempted first; falls back to CPU.

**Step 2 — Continuous sampling** · Every 400 ms the hook captures a video frame and extracts **52 blendshape scores**, accumulating 10 metrics for the full session:

| Metric | Description |
|---|---|
| `facePresentRate` | % of frames where a face was detected |
| `attentionRate` | Eye openness proxy (> 0.35 threshold) |
| `smileRate` | % of frames with active smile blendshapes |
| `positiveExpressionRate` | Duchenne smile detection (smile + low brow tension) |
| `expressionStability` | Frame-to-frame consistency — penalises nervous flickering |
| `averageSmile` | Mean smile intensity 0–100 |
| `averageEyeOpenness` | Mean eye openness 0–100 |
| `averageBrowTension` | Mean brow tension 0–100 |
| `averageMouthMovement` | Mean jaw/lip activity 0–100 |
| `sampleCount` | Total frames analysed |

**Step 3 — Submission** · At session close, the frontend sends the aggregated metrics to the backend alongside the final audio answer.

**Step 4 — Scoring** · The backend validates and sanitises the metrics, then computes the **coaching score** (0–100):

```
score = 0.25 × facePresentRate + 0.25 × attentionRate
      + 0.20 × positiveExpressionRate + 0.20 × expressionStability
      + 0.10 × averageEyeOpenness
```

**Step 5 — Report** · A human-readable summary (e.g. *"steady camera presence, positive facial engagement"*) and the score are appended to the **PDF report** under a *Facial Expression Coaching* section.

### Privacy

- **No video is recorded or transmitted.** All frame processing happens locally in the browser.
- The server only receives the 10 numeric aggregates.
- The score requires `sampleCount ≥ 3` and `facePresentRate ≥ 15 %` — otherwise it is omitted.
- The feature is explicitly framed as **coaching context**, not emotion detection or clinical assessment.

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
