const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const PORT = 5000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://roomie-chat.vercel.app/", // frontend URL
    methods: ["GET", "POST"]
  },
});

// Health Check Endpoint
app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

const stillAlive = () => {
  const url = `https://roomiechat.onrender.com/healthcheck`;  
  axios
    .get(url)
    .then(() => console.log(`stillAlive: Backend is active`))
    .catch((err) => console.error(`stillAlive: Error pinging backend - ${err.message}`));
};
 
setInterval(stillAlive, 15 * 60 * 1000);  

// Track users in rooms
const rooms = new Map();

io.on("connection", (socket) => {
  console.log('User connected:', socket.id);

  // Broadcast updated user count
  io.emit("userCount", io.engine.clientsCount);

  // Handle room creation
  socket.on("createRoom", (room) => {
    if (rooms.has(room)) {
      socket.emit("roomError", "Room already exists");
      return;
    }

    socket.join(room);
    rooms.set(room, new Set([socket.id]));
    socket.emit("chat", {
      message: `You have created and joined the room: ${room}`,
      userName: "System",
      timestamp: new Date().toLocaleTimeString()
    });

    socket.to(room).emit("chat", {
      message: `A new user has joined the room`,
      userName: "System",
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Handle joining a room
  socket.on("joinRoom", (room) => {
    if (!rooms.has(room)) {
      socket.emit("roomError", "Room doesn't exist");
      return;
    }

    socket.join(room);
    rooms.get(room).add(socket.id);
    socket.emit("chat", {
      message: `You have joined the room: ${room}`,
      userName: "System",
      timestamp: new Date().toLocaleTimeString()
    });

    socket.to(room).emit("chat", {
      message: `A new user has joined the room`,
      userName: "System",
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Handle leaving a room
  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    if (rooms.has(room)) {
      rooms.get(room).delete(socket.id);
      if (rooms.get(room).size === 0) {
        rooms.delete(room);
      } else {
        socket.to(room).emit("chat", {
          message: `A user has left the room`,
          userName: "System",
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }
  });

  // Handle chat messages
  socket.on("chat", (payload) => {
    io.to(payload.room).emit("chat", payload);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    rooms.forEach((users, room) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        if (users.size === 0) {
          rooms.delete(room);
        } else {
          io.to(room).emit("chat", {
            message: `A user has disconnected`,
            userName: "System",
            timestamp: new Date().toLocaleTimeString()
          });
        }
      }
    });

    io.emit("userCount", io.engine.clientsCount);
  });
});

server.listen(PORT, () => {
  console.log("Server is running on port 5000");
});
