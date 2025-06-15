const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // Adjust this to your frontend URL
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', ({ userId, chatWith }) => {
      const room = [userId, chatWith].sort().join('_');
      socket.join(room);
      console.log(`${userId} joined room: ${room}`);
    });

    socket.on('leaveRoom', ({ userId, chatWith }) => {
      const room = [userId, chatWith].sort().join('_');
      socket.leave(room);
      console.log(`${userId} left room: ${room}`);
    });

    socket.on('message', ({ userId, chatWith, text }) => {
      const room = [userId, chatWith].sort().join('_');
      const msg = { userId, text, timestamp: new Date() };
      socket.to(room).emit('message', msg);
      console.log(`Message sent to room ${room}:`, msg);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO }; 