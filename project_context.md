# Mess Management Project Context

## Overview
This is a full-stack **Mess Management System** designed to handle various aspects of hostel dining, such as menu management, attendance tracking, waste monitoring, real-time chat, and AI-based features.

## Tech Stack
### Frontend
- **Framework**: React 19 + Vite
- **State Management**: Redux Toolkit (`react-redux`, `@reduxjs/toolkit`)
- **Routing**: React Router DOM v7
- **Styling & UI**: Framer Motion (animations), Lucide React (icons)
- **Data Fetching**: Axios
- **Visualization**: Recharts
- **Other utilities**: `qrcode.react` (likely for attendance/scanning), `socket.io-client` (real-time chat)

### Backend
- **Runtime & Framework**: Node.js + Express.js
- **Database**: MongoDB via Mongoose
- **Real-time Communication**: Socket.IO
- **Security & Auth**: JWT (`jsonwebtoken`) for authentication, `bcryptjs` for password hashing, `cors`
- **Environment**: `dotenv`

## Project Structure
- **/frontend**: React client application.
  - `src/`: UI components, Redux slices, pages, etc.
- **/backend**: Express server application.
  - `config/`: Database connection (`db.js`)
  - `models/`: Mongoose schemas (e.g., `Message.js`, User, Menu, etc.)
  - `routes/`: API endpoints (`auth.js`, `menu.js`, `attendance.js`, `waste.js`, `hostels.js`, `ai.js`, `chat.js`)
  - `middleware/`: Express middlewares (e.g., auth guards)
  - `server.js`: Main entry point configuring Express, Socket.IO, and routing.
  - `seed.js`: Database seeding script.
- **/docs**: Documentation files.

## Core Features
1. **Authentication & Authorization** (`/api/auth`)
2. **Menu Management** (`/api/menu`)
3. **Attendance Tracking** (`/api/attendance`) - likely integrated with QR codes.
4. **Waste Management** (`/api/waste`)
5. **Hostel Management** (`/api/hostels`)
6. **Real-time Chat** (`/api/chat` + Socket.IO) - Supports hostel-specific chat rooms (`join_hostel_room` events).
7. **AI Integrations** (`/api/ai`) - Potentially for food waste prediction or menu suggestions.

## How to Run Locally
1. **Backend**:
   - `cd backend`
   - `npm install`
   - Create a `.env` file with `PORT`, `MONGO_URI`, and `JWT_SECRET`.
   - `npm run dev` (Runs on port 5000 by default)

2. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
