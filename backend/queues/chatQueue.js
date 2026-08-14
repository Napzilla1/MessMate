const { Queue, Worker } = require('bullmq');
const Message = require('../models/Message');
const mongoose = require('mongoose');

/**
 * Chat persistence queue backed by Redis.
 * Decouples the real-time broadcast from the MongoDB write.
 * Messages are broadcast immediately via Socket.io, then persisted
 * asynchronously through this queue with automatic retries.
 */
const createChatQueue = (redisConnection) => {
  const retryAttempts = parseInt(process.env.BULL_RETRY_ATTEMPTS || '3', 10);
  const retryDelay = parseInt(process.env.BULL_RETRY_DELAY_MS || '1000', 10);

  const chatQueue = new Queue('chat-persistence', {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: retryAttempts,
      backoff: {
        type: 'exponential',
        delay: retryDelay,
      },
      removeOnComplete: true,
      removeOnFail: 50, // Keep last 50 failed jobs for debugging
    },
  });

  // Worker that processes the queue and writes to MongoDB
  const chatWorker = new Worker(
    'chat-persistence',
    async (job) => {
      const { hostel, sender, senderName, senderRole, text } = job.data;

      // Ensure mongoose is connected (worker may start before connection in edge cases)
      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB not connected — will retry');
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
      connection: redisConnection,
      concurrency: 5, // Process up to 5 messages in parallel
    }
  );

  chatWorker.on('completed', (job) => {
    // Successful persistence — no action needed
  });

  chatWorker.on('failed', (job, err) => {
    console.error(`[ChatQueue] Job ${job?.id} failed after ${job?.attemptsMade} attempts:`, err.message);
  });

  /**
   * Add a message to the persistence queue.
   * @param {Object} messageData - { hostel, sender, senderName, senderRole, text }
   */
  const enqueue = async (messageData) => {
    await chatQueue.add('persist-message', messageData);
  };

  return { enqueue, chatQueue, chatWorker };
};

module.exports = createChatQueue;
