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

    socket.on('joinChat', () => {
      // Handle user joining a chat room or logic here
      console.log('User joined chat:', socket.id);
    });

    socket.on('sendMessage', (message) => {
      // Broadcast the message to all connected clients
      io.emit('receiveMessage', message);
      console.log('Message sent:', message);
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