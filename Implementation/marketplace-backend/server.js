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

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Socket.IO + Redis
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

(async () => {
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

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
