const { Queue, Worker } = require('bullmq');
const mongoose = require('mongoose');
const Message = require('../models/Message');

const connection = {
  host: '127.0.0.1',
  port: 6379,
};

// Create a new queue
const chatQueue = new Queue('chat-persistence', { connection });

// Define the worker that processes the queue
const chatWorker = new Worker(
  'chat-persistence',
  async (job) => {
    const { hostel, sender, senderName, senderRole, text } = job.data;
    
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }

    await Message.create({
      hostel,
      sender,
      senderName,
      senderRole,
      text,
    });
  },
  { 
    connection,
    concurrency: 5 // Process up to 5 messages concurrently
  }
);

chatWorker.on('completed', (job) => {
  // console.log(`Job ${job.id} completed successfully`);
});

chatWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});

const enqueueChatMessage = async (messageData) => {
  await chatQueue.add('persist-message', messageData, {
    attempts: parseInt(process.env.BULL_RETRY_ATTEMPTS) || 3,
    backoff: {
      type: 'exponential',
      delay: parseInt(process.env.BULL_RETRY_DELAY_MS) || 1000,
    },
    removeOnComplete: true, // Keep Redis clean
  });
};

module.exports = { enqueueChatMessage, chatQueue, chatWorker };
