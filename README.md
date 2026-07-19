# TradeLab 📈

[![Build Status](https://github.com/toxicbishop/Student-Stock-Market-Analysis/actions/workflows/ci.yml/badge.svg)](https://github.com/toxicbishop/Student-Stock-Market-Analysis/actions/workflows/ci.yml)
[![CodeQL](https://github.com/toxicbishop/Student-Stock-Market-Analysis/actions/workflows/codeql.yml/badge.svg)](https://github.com/toxicbishop/Student-Stock-Market-Analysis/actions/workflows/codeql.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Python 3.12.x](https://img.shields.io/badge/Python%203.12.x-3776AB?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![Platform](https://img.shields.io/badge/platform-Web-lightgrey.svg)
![License: GPL 3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg)

### AI-Guided Paper Trading & Financial Learning Platform

**TradeLab** was developed for **ELECTROHACK 3.0**, a National Level Hackathon at K.S. Institute of Technology. Our mission is to bridge the massive gap in financial literacy among Indian students (ages 18–24) by providing a risk-free environment to learn, practice, and master the stock market.

---

## The Problem

India has a population of 1.5 billion, yet fewer than 8 crore demat accounts exist. Most students want to invest but face significant barriers:

- **Intimidating Complexity:** Existing platforms are built for professionals, not beginners.
- **Capital Risk:** 90% of students fear losing their limited savings.
- **Lack of Guidance:** When students lose virtual money on other simulators, they don't know _why_.

## Our Solution

TradeLab is a learning-first ecosystem designed to turn market fear into financial confidence.

- **Risk-Free Paper Trading:** Trade with virtual currency in real-market conditions without losing real money.
- **AI-Powered Insights:** Real-time feedback explaining the "why" behind trade successes or failures (via Google Gemini).
- **Modern Dashboard:** A simplified, premium "Color Dashboard UI" that focuses on education over raw data-overload.
- **Campus Leaderboards:** Competitive learning to encourage students to grow together.

## Tech Stack

- **Modern Frontend (v2):** React.js (TypeScript, Tailwind CSS, Firebase, Motion)
- **Legacy Frontend (v1):** React.js (Original Python-integrated version)
- **Backend:** Python (FastAPI/PostgreSQL) or Node.js (Proxy Server)
- **Database:** Firebase Firestore (Real-time) or PostgreSQL (Relational)
- **AI:** Google Gemini Integration

## Architecture

A full-stack overview of how the frontend, FastAPI backend, SQLite database, Firebase Auth, and Gemini AI fit together.

![TradeLab Architecture](public/Student%20Stock%20Market%20Analysis%20(TradeLab)%20%E2%80%94%20Architecture.png)

---

## Installation & Setup

### 1. Modern Dashboard (v2) - Recommended
To run the latest dashboard with the improved UI and AI features:

```bash
cd frontend
pnpm install
pnpm run dev
```

### 2. Backend (Python/FastAPI)
If using the relational data features or legacy integration:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Environment Variables:
Create a `.env` file in the `frontend` directory:
- `GEMINI_API_KEY`: Your Google AI Studio API key.

---

The Team<br>
Mithil<br>
Pranav Arun<br>
Supreeth N<br>

<p align="center">
  Developed at Electrohack 3.0, K.S. Institute of Technology.
</p>

