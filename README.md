# MessMate - Mess Management System

## Overview
MessMate is a comprehensive full-stack **Mess Management System** designed to streamline and handle various aspects of hostel dining, including menu management, attendance tracking, waste monitoring, real-time chat, and AI-based features.

## Tech Stack
### Frontend
- **Framework**: React 19 + Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v7
- **Styling**: Framer Motion, Lucide React, Custom CSS
- **Data Fetching**: Axios
- **Real-time Communication**: Socket.io-client
- **Visualization**: Recharts

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB (via Mongoose)
- **Real-time Chat**: Socket.IO
- **Security**: JWT Authentication, Bcrypt.js password hashing

## Core Features
- 🔐 **Authentication & Authorization**: Secure login for staff and students.
- 📅 **Menu Management**: Daily and weekly mess menu planning.
- 📲 **Attendance Tracking**: Monitor student attendance at meals with QR support.
- ♻️ **Waste Management**: Track and minimize food waste.
- 🏢 **Hostel Management**: Dedicated spaces for managing multiple hostels.
- 💬 **Real-time Chat**: Hostel-specific live chat rooms using WebSockets.
- 🤖 **AI Integrations**: Smart suggestions and analytics.

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB instance running

### Installation

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with PORT, MONGO_URI, and JWT_SECRET
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
