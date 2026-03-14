# 📉 TradeLab: India's First AI-Powered Student Trading Platform

> **"Turning paper trading from a simulator into a school."**

TradeLab is a revolutionary fintech-edtech platform designed specifically for Indian college students. We remove the fear of losing real money and replace it with a structured, AI-guided learning path to financial literacy.

---

## 🚀 The Vision
To become India's largest financial literacy platform, empowering 5 million+ students within 5 years to navigate the stock market with confidence and strategy.

---

## 🧐 The Problem
India has 1.5 billion people but fewer than 8 crore demat accounts. Most students (18–24) want to invest but face significant barriers:
- **Complexity:** Existing platforms are built for pros, not beginners.
- **Fear:** 90% of students fear losing their limited capital (₹5,000–₹20,000).
- **Lack of Guidance:** When students lose virtual money on other simulators, they don't know *why*.
- **No Path:** No platform combines learning, practice, and feedback in one place.

## ✨ Our Solution: Why TradeLab is Different
TradeLab doesn't just let you trade; it teaches you how to trade better.

### 🤖 AI Trade Mentor
Our proprietary AI engine (trained on Indian market patterns) analyzes every trade and explains the "WHY" behind every profit or loss in plain language.
- *Example:* "You bought when the RSI was over 75. The market was exhausted. Next time, wait for a cooldown (RSI < 50)."

### 🏆 Gamified Learning
We host **College-vs-College Tournaments** to make learning social and competitive. Rank up on the leaderboard and represent your institution!

### 📚 Structured Curriculum
A beginner-to-advanced learning path spanning 5+ structured lessons, taking you from "Zero" to a "Confident Investor."

---

## 🛠️ Key Features
- **Real-time Simulation:** Live NSE/BSE data with a ₹10,000 virtual portfolio.
- **Mistake Analyzer:** Uses a logic engine to identify common pitfalls like "The FOMO Peak" or "Catching a Falling Knife."
- **Regional Support:** Built for the Indian context with plans for multi-language support.
- **Institutional Access:** Partnering with universities to integrate financial literacy into the curriculum.

---

## 💻 Tech Stack
- **Backend:** FastAPI (Python 3.10+)
- **Database:** PostgreSQL with SQLAlchemy (Async)
- **AI Engine:** Rule-based Logic + Anthropic Claude API
- **Market Data:** Live NSE/BSE via yfinance

---

## 🛠️ Getting Started (Backend)

### 1. Prerequisites
- Python 3.10 or higher
- PostgreSQL installed and running

### 2. Setup
```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration
Edit the `backend/.env` file with your database credentials and optional Anthropic API key.

### 4. Run the API
```bash
cd backend
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000` and the interactive docs at `http://localhost:8000/docs`.

---

## 📂 Project Structure
- `backend/`: Core API and logic.
  - `routers/`: API endpoints for stocks, portfolios, AI, and groups.
  - `models.py`: Database schema definitions.
  - `analyzer.py`: The proprietary Trade Analysis engine.
- `files/`: (Legacy) Original source files.
- `Logic-Engine.py`: (Legacy) Initial prototype logic.

---

## 👥 The Team
We are a dedicated team of engineering students from KSIT, building the solution we wished existed when we started our investing journey.

| Name | Role / USN |
| :--- | :--- |
| **Mithil** | 1KG23CB030 |
| **Pranav** | 1KG23CB038 |
| **Supreeth** | 1KG23CB051 |

---

## 📈 Market Impact
- **TAM:** 39 Million Indian College Students.
- **Validation:** Surveyed 200+ students; 82% want a gamified simulator.
- **Momentum:** 50+ active beta users already testing our MVP.

---

*TradeLab is more than an app; it's a movement to bridge the financial literacy gap in India. Join us as we build the future of retail investing!*
