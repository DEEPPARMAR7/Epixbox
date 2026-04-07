const { getIO } = require('../socket');

const memoryStore = new Map();

function pushUserNotification(userId, notification) {
  if (!userId) return;

  const list = memoryStore.get(userId) || [];
  list.unshift({
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    createdAt: new Date().toISOString(),
    ...notification,
  });

  memoryStore.set(userId, list.slice(0, 100));

  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
}

function getRecentNotifications(userId) {
  return memoryStore.get(userId) || [];
}

module.exports = {
  pushUserNotification,
  getRecentNotifications,
};
