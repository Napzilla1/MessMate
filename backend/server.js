const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const http = require('http');
const socketIo = require('socket.io');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ─── Redis Setup (OTP Storage, Menu Caching, Rate Limiting) ─────
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redisClient = null;

const setupRedis = () => {
  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    client.on('connect', () => {
      redisClient = client;
      app.set('redisClient', client);
      console.log('[Redis] Connected — OTP storage, menu caching, and rate limiting active');
    });

    client.on('error', () => {
      if (!redisClient) {
        console.log('[Redis] Not available — running without Redis (OTP, caching, and rate limiting features will be unavailable)');
      }
    });
  } catch (err) {
    console.log('[Redis] Not available — running without Redis');
  }
};
setupRedis();

// ─── Socket.io Connection Handling (QR Attendance Only) ─────────
app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);

  socket.on('join_hostel_room', (hostel) => {
    socket.join(hostel);
    console.log(`Socket ${socket.id} joined room: ${hostel}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/waste', require('./routes/waste'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/hostels', require('./routes/hostels'));
app.use('/api/forecast', require('./routes/forecast'));
app.use('/api/gemini', require('./routes/gemini'));
app.use('/api/announcements', require('./routes/announcements'));

app.get('/', (req, res) => {
  res.send('Mess Management API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
