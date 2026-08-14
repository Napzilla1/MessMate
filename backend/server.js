const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Worker } = require('worker_threads');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const http = require('http');
const socketIo = require('socket.io');
const Redis = require('ioredis');
const { createAdapter } = require('@socket.io/redis-adapter');
const createRateLimiter = require('./middleware/rateLimiter');
const createChatQueue = require('./queues/chatQueue');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ─── Redis Setup ────────────────────────────────────────────────
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Pub/Sub pair for Socket.io adapter
const pubClient = new Redis(redisUrl);
const subClient = pubClient.duplicate();

// General-purpose Redis client for rate limiting, etc.
const redisClient = new Redis(redisUrl);

pubClient.on('connect', () => console.log('[Redis] Pub client connected'));
subClient.on('connect', () => console.log('[Redis] Sub client connected'));
redisClient.on('connect', () => console.log('[Redis] General client connected'));
pubClient.on('error', (err) => console.error('[Redis] Pub client error:', err.message));
subClient.on('error', (err) => console.error('[Redis] Sub client error:', err.message));
redisClient.on('error', (err) => console.error('[Redis] General client error:', err.message));

// ─── Socket.io Redis Adapter ───────────────────────────────────
// Syncs all Socket.io rooms across multiple Node.js processes
io.adapter(createAdapter(pubClient, subClient));
console.log('[Socket.io] Redis adapter attached — multi-process ready');

// ─── Rate Limiter ──────────────────────────────────────────────
const { checkRateLimit, cleanup: cleanupRateLimit } = createRateLimiter(redisClient);

// ─── Chat Persistence Queue ────────────────────────────────────
const { enqueue: enqueueChatMessage } = createChatQueue({
  host: new URL(redisUrl).hostname || '127.0.0.1',
  port: parseInt(new URL(redisUrl).port || '6379', 10),
});

// ─── Read Receipt Worker Thread ────────────────────────────────
const readReceiptWorker = new Worker(
  path.join(__dirname, 'workers', 'readReceiptWorker.js')
);
readReceiptWorker.postMessage({
  type: 'init',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mess-management',
});
readReceiptWorker.on('message', (msg) => {
  if (msg.type === 'ready') {
    console.log('[ReadReceiptWorker] Connected and ready');
  }
});
readReceiptWorker.on('error', (err) => {
  console.error('[ReadReceiptWorker] Error:', err.message);
});

// ─── Socket.io Connection Handling ─────────────────────────────
app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected via WebSocket:', socket.id);

  socket.on('join_hostel_room', (hostel) => {
    socket.join(hostel);
    console.log(`Socket ${socket.id} joined room: ${hostel}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { hostel, senderId, senderName, senderRole, text } = data;

      // ── Rate Limiting ──
      const { allowed, retryAfter } = await checkRateLimit(socket.id);
      if (!allowed) {
        socket.emit('rate_limit', {
          message: `Slow down! You can send again in ${retryAfter}s.`,
          retryAfter,
        });
        return;
      }

      // ── Optimistic Broadcast ──
      // Broadcast immediately so all users see the message in real-time
      const optimisticMessage = {
        hostel,
        sender: senderId,
        senderName,
        senderRole,
        text,
        createdAt: new Date(),
        _id: new require('mongoose').Types.ObjectId().toString(),
      };
      io.to(hostel).emit('receive_message', optimisticMessage);

      // ── Async Persistence via Bull Queue ──
      // MongoDB write happens in the background with automatic retries
      await enqueueChatMessage({
        hostel,
        sender: senderId,
        senderName,
        senderRole,
        text,
      });

    } catch (err) {
      console.error('Error handling chat message:', err);
    }
  });

  // ── Read Receipts ──
  socket.on('mark_read', (data) => {
    const { hostel, messageId, userId } = data;

    // Forward to worker thread for batched DB writes
    readReceiptWorker.postMessage({
      type: 'mark_read',
      hostel,
      messageId,
      userId,
    });

    // Broadcast read receipt immediately without waiting for DB
    io.to(hostel).emit('read_receipt', {
      messageId,
      userId,
      readAt: new Date(),
    });
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    // Clean up rate limit data for this socket
    await cleanupRateLimit(socket.id);
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
app.use('/api/hostels', require('./routes/hostels'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
  res.send('Mess Management API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
