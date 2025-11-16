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

// Serve static files
app.use('/public', express.static('public'));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/listings", require("./routes/listings"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/pricing", require("./routes/pricing"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/password-reset", require("./routes/passwordReset"));

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// Optional Redis setup (only if REDIS_URL is provided)
(async () => {
  if (process.env.REDIS_URL) {
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
  } else {
    console.log('💾 No Redis URL provided, using memory adapter');
  }

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    // Join user to their personal room
    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined room user_${userId}`);
    });

    // Handle real-time message sending
    socket.on("sendMessage", async (messageData) => {
      try {
        console.log("📤 Sending message:", messageData);
        
        // Import message model here to avoid circular dependency
        const Message = require('./models/Message');
        
        // Create and save the message to database
        const newMessage = new Message({
          sender: messageData.senderId,
          receiver: messageData.receiverId,
          content: messageData.content,
          listing: messageData.listingId || null,
          createdAt: new Date()
        });
        
        const savedMessage = await newMessage.save();
        await savedMessage.populate(['sender', 'receiver', 'listing']);
        
        // Emit to receiver's room for real-time delivery
        io.to(`user_${messageData.receiverId}`).emit("newMessage", {
          ...savedMessage.toObject(),
          _id: savedMessage._id.toString()
        });
        
        // Confirm delivery to sender
        socket.emit("messageDelivered", {
          ...savedMessage.toObject(),
          _id: savedMessage._id.toString()
        });
        
        console.log(`✅ Message delivered from ${messageData.senderId} to ${messageData.receiverId}`);
      } catch (error) {
        console.error("❌ Error sending message:", error);
        socket.emit("messageError", { error: error.message });
      }
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
      socket.to(`user_${data.receiverId}`).emit("userTyping", {
        senderId: data.senderId,
        isTyping: data.isTyping
      });
    });

    // Handle user going online/offline
    socket.on("userOnline", (userId) => {
      socket.broadcast.emit("userStatusChanged", {
        userId: userId,
        isOnline: true
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`⚡ Socket.IO server ready and listening`);
    console.log(`🌐 CORS enabled for all origins`);
  });
})();
