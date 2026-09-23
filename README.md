<div align="center">
  <h1>🍛 MessMate</h1>
  <p><strong>Smart Hostel Mess Management & AI-Powered Demand Forecasting</strong></p>

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
  ![Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)
</div>

<br/>

> A full-stack, multi-tenant hostel dining platform with real-time QR attendance, Redis-backed caching and auth, and Gemini-powered menu generation.

## 📖 The Problem
Hostel kitchens cook blindly for hundreds of students every day, resulting in massive food waste and budget inefficiency. 

**MessMate** solves this by bridging the gap between student intent (RSVPs) and actual turnout (QR Check-ins). By feeding this real-time data into a customized AI model, MessMate tells managers exactly how much food to prepare, drastically slashing food waste.

---

## ✨ Architectural Highlights

### ⚡ Performance & Caching
* **Redis Cache-Aside:** The high-traffic weekly menu API is cached in Redis with a 12-hour TTL and write-side `DEL` auto-invalidation, reducing MongoDB read load by ~95%.
* **CPU-Isolation via Worker Threads:** Heavy synchronous tasks—like processing 10,000+ records for CSV report generation and executing AI prompts—are offloaded to dedicated Node.js `worker_threads` to prevent blocking the main Express event loop.

### 🔒 Security & Authentication
* **Sliding-Window Rate Limiting:** A custom Redis Sorted Sets (`ZREMRANGEBYSCORE` / `ZCOUNT`) rate limiter protects all auth endpoints against brute-force and email-bombing attacks.
* **Ephemeral OTP Storage:** Registration and password reset flows use OTPs hashed via SHA-256 and stored strictly in Redis using `SETEX` for automatic memory clearance after 10 minutes.
* **Role-Based Access (RBAC):** Strict JWT middleware enforcement separating `Student`, `Manager`, and `Admin` tiers.

### 📡 Real-Time Systems
* **Zero-Latency Attendance:** Students check in using short-lived, cryptographically signed JWT QR tickets. Upon successful validation, **Socket.IO** broadcasts the event to a hostel-scoped room, updating the manager's dashboard instantly without HTTP polling.

### 🧠 AI & RAG (Retrieval-Augmented Generation)
* **Database-Grounded Analytics:** Uses a custom RAG pipeline connecting MongoDB to **Google Gemini (gemini-2.5-flash)**. The backend dynamically aggregates the last 7 days of waste metrics and tomorrow's RSVPs to generate highly accurate, data-backed cooking forecasts for managers.
* **Human-in-the-Loop Menu Generation:** AI generates structured JSON 7-day menus with a preview-first UI, ensuring the manager always retains final approval.

---

## 🚀 Quick Start / Local Development

### Prerequisites
* Node.js (v18+)
* MongoDB (Local or Atlas)
* Redis Server (Running on port `6379`)
* Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/MessMate.git
cd MessMate
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/messmate
JWT_SECRET=your_super_secret_jwt_key
REDIS_URL=redis://127.0.0.1:6379
GEMINI_API_KEY=your_google_gemini_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

---

## 📂 Project Structure

```text
MessMate/
├── backend/
│   ├── middleware/    # JWT Auth & Redis Rate Limiter
│   ├── models/        # Mongoose Schemas (User, Menu, Attendance, Waste, Hostel, Announcement)
│   ├── routes/        # Express API endpoints
│   ├── workers/       # Node.js Worker Threads (forecastWorker.js, reportWorker.js)
│   └── server.js      # Entry point & Socket.io setup
└── frontend/
    ├── src/
    │   ├── pages/     # React views segregated by role (Admin, Manager, Student)
    │   ├── store/     # Redux Toolkit state slices
    │   └── App.jsx    # React Router setup
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/MessMate/issues).

## 📝 License
This project is [MIT](LICENSE) licensed.
