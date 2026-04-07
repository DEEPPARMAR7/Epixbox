const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let ioInstance = null;

function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next();

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me');
      socket.userId = decoded.id;
      return next();
    } catch (err) {
      return next(new Error('Unauthorized socket'));
    }
  });

  ioInstance.on('connection', (socket) => {
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on('notifications:subscribe', ({ userId }) => {
      if (userId) socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {});
  });

  return ioInstance;
}

function getIO() {
  return ioInstance;
}

module.exports = {
  initSocket,
  getIO,
};
