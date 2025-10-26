const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createServer } = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/listings", require("./routes/listings"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/admin", require("./routes/admin"));

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Socket.IO + Redis
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

(async () => {
  try {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    // Add error handlers to prevent warnings
    pubClient.on('error', (err) => {
      console.log('Redis pubClient error:', err.message);
    });
    
    subClient.on('error', (err) => {
      console.log('Redis subClient error:', err.message);
    });

    await pubClient.connect();
    await subClient.connect();

    io.adapter(createAdapter(pubClient, subClient));
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.log('⚠️ Redis connection failed, using memory adapter:', error.message);
    // Socket.IO will use memory adapter by default
  }

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    socket.on("sendMessage", (msg) => {
      socket.broadcast.emit("receiveMessage", msg);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();
