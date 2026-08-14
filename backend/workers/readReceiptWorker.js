const { parentPort } = require('worker_threads');
const mongoose = require('mongoose');

/**
 * Read Receipt Worker Thread
 * Batches read receipt updates every 500ms and writes them
 * to MongoDB with a single updateMany call instead of one-per-message.
 */

let batch = [];
let mongoConnected = false;
let Message;

const FLUSH_INTERVAL_MS = 500;

const flush = async () => {
  if (batch.length === 0 || !mongoConnected) return;

  const toFlush = [...batch];
  batch = [];

  // Group by hostel for efficient updates
  const grouped = {};
  for (const item of toFlush) {
    const key = item.hostel;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  try {
    for (const [hostel, items] of Object.entries(grouped)) {
      const messageIds = items.map(i => i.messageId).filter(Boolean);
      const readEntry = {
        userId: items[0].userId,
        readAt: new Date(),
      };

      if (messageIds.length > 0) {
        await Message.updateMany(
          { 
            _id: { $in: messageIds },
            'readBy.userId': { $ne: readEntry.userId } // Don't duplicate
          },
          { $push: { readBy: readEntry } }
        );
      }
    }
  } catch (err) {
    console.error('[ReadReceiptWorker] Flush error:', err.message);
    // Re-add failed items to the batch for next flush
    batch.push(...toFlush);
  }
};

// Flush every FLUSH_INTERVAL_MS
setInterval(flush, FLUSH_INTERVAL_MS);

// Receive messages from the main thread
parentPort.on('message', async (msg) => {
  if (msg.type === 'init') {
    // Connect to MongoDB
    try {
      await mongoose.connect(msg.mongoUri);
      Message = require('../models/Message');
      mongoConnected = true;
      parentPort.postMessage({ type: 'ready' });
    } catch (err) {
      console.error('[ReadReceiptWorker] MongoDB connection failed:', err.message);
    }
  } else if (msg.type === 'mark_read') {
    // Add to batch
    batch.push({
      hostel: msg.hostel,
      messageId: msg.messageId,
      userId: msg.userId,
    });
  }
});
