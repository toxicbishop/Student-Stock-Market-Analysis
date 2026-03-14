# TradeLab 📈
### AI-Guided Paper Trading & Financial Learning Platform

**TradeLab** was developed for **ELECTROHACK 3.0**, a National Level Hackathon at K.S. Institute of Technology. Our mission is to bridge the massive gap in financial literacy among Indian students (ages 18–24) by providing a risk-free environment to learn, practice, and master the stock market.

---

## 🚀 The Problem
India has a population of 1.5 billion, yet fewer than 8 crore demat accounts exist. Most students want to invest but face significant barriers:
* **Intimidating Complexity:** Existing platforms are built for professionals, not beginners.
* **Capital Risk:** 90% of students fear losing their limited savings.
* **Lack of Guidance:** When students lose virtual money on other simulators, they don't know *why*.

## ✨ Our Solution
TradeLab is a learning-first ecosystem designed to turn market fear into financial confidence.
* **Risk-Free Paper Trading:** Trade with virtual currency in real-market conditions without losing real money.
* **AI-Powered Insights:** Real-time feedback explaining the "why" behind trade successes or failures.
* **Structured Learning Path:** A simplified UI that focuses on education over raw data-overload.
* **Campus Leaderboards:** Competitive learning to encourage students to grow together.

## 🛠️ Tech Stack
* **Frontend:** React.js (with Tailwind CSS)
* **Backend:** Python (Flask/FastAPI)
* **Database:** PostgreSQL (Relational data for transaction integrity)
* **APIs:** Market Data APIs & AI Analysis Integration

## 🗄️ Database Schema
We utilized **PostgreSQL** to ensure ACID compliance for all virtual financial transactions.

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| **Users** | Profile & Auth | `username`, `email`, `password_hash`, `virtual_balance` |
| **Stocks** | Market Data Cache | `symbol`, `company_name`, `sector` |
| **Trades** | Transaction History | `trade_type` (Buy/Sell), `quantity`, `price_at_execution` |
| **Portfolios** | User Holdings | `quantity_held`, `avg_buy_price`, `user_id` |

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/toxicbishop/Student-Stock-Market-Analysis.git](https://github.com/toxicbishop/Student-Stock-Market-Analysis.git)
2. **Backend Setup (Python):**
```bash
   cd server
pip install -r requirements.txt
python app.py
```
3. Frontend Setup (React):
```bash
cd client
npm install
npm run dev
```
4. Environment Variables:
Create a .env file in the root directory with your DATABASE_URL and your specific Market API keys.

👥 The Team<br>
Mithil<br>
Pranav Arun<br>
Supreeth N<br>
<p align="center">
  Developed with ❤️ at Electrohack 3.0, K.S. Institute of Technology.
</p>
