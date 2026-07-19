# ⚡ AI Code Review Assistant

A full-stack web application that reviews code automatically using a two-stage pipeline: static analysis (ESLint) followed by AI-powered review (Google Gemini). Users sign in, paste or upload code, and get instant feedback on bugs, code quality, complexity, and best practices — with auto-generated documentation and full review history.

## Features

- 🔐 User authentication (Supabase Auth) with protected routes and per-user data security (RLS)
- 📁 Code input via paste or file upload (.js, .jsx, .py) with language auto-detection
- 🔍 Stage 1: Static analysis using ESLint — errors, warnings, line numbers, rules
- 🤖 Stage 2: AI review using Google Gemini — bugs, code smells, complexity rating, improvement suggestions, and fully corrected code
- 📝 AI documentation generator (JSDoc-style comments)
- 📂 Review history with live search and language filter
- 🎨 Dark-themed responsive dashboard with severity badges

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (JWT) |
| AI Integration | Google Gemini API |
| Static Analysis | ESLint |

## How to Run Locally

1. Clone the repo and install dependencies:
2. Create `client/.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`
3. Create `server/.env` with `SUPABASE_URL`, `SUPABASE_KEY`, and `GEMINI_API_KEY`
4. Start both servers:

## How It Works

User submits code → Express server verifies the Supabase JWT → ESLint runs static analysis → code + findings are sent to Gemini with a structured prompt → combined results are saved to PostgreSQL (with row-level security) → dashboard renders both stages with severity badges, improved code, and copy actions.