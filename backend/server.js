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
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io integration
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
      
      // Save to database
      const newMessage = await Message.create({
        hostel,
        sender: senderId,
        senderName,
        senderRole,
        text
      });

      // Broadcast to everyone in the room
      io.to(hostel).emit('receive_message', newMessage);
    } catch (err) {
      console.error('Error saving chat message:', err);
    }
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
