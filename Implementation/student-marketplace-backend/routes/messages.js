const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, content, listingId } = req.body;
    const senderId = req.user.id;

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Create new message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      listing: listingId || null
    });

    await message.save();

    // Populate sender info for response
    await message.populate('sender', 'name');
    await message.populate('receiver', 'name');

    res.status(201).json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation with a specific user for a specific listing
router.get('/conversation/:userId/:listingId', auth, async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const currentUserId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Build query based on whether listingId is provided
    let query = {
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    };

    // If listingId is not 'undefined', filter by listing
    if (listingId && listingId !== 'undefined') {
      query.listing = listingId;
    }

    const messages = await Message.find(query)
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .populate({
        path: 'listing',
        select: 'title price image seller',
        populate: {
          path: 'seller',
          select: 'name'
        }
      })
      .sort({ createdAt: 1 }) // Oldest first for chat
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Get conversation with a specific user (general conversation)
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .populate({
      path: 'listing',
      select: 'title price image seller',
      populate: {
        path: 'seller',
        select: 'name'
      }
    })
    .sort({ createdAt: 1 }) // Oldest first for chat
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Get all conversations (debug version)
router.get('/conversations-debug', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Get all messages for this user
    const allMessages = await Message.find({
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId }
      ]
    })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .populate({
      path: 'listing',
      select: 'title seller',
      populate: {
        path: 'seller',
        select: 'name'
      }
    })
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      totalMessages: allMessages.length,
      messages: allMessages.slice(0, 5), // Just return first 5 for debugging
      currentUserId
    });
  } catch (error) {
    console.error('Debug conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch debug data' });
  }
});

// Get all conversations (optimized version)
router.get('/conversations', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    console.log('📊 Getting conversations for user:', currentUserId);

    // Get all messages involving the current user with minimal data first
    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .populate({
      path: 'listing',
      select: 'title price image seller',
      populate: {
        path: 'seller',
        select: 'name'
      }
    })
    .sort({ createdAt: -1 })
    .lean(); // Use lean() for faster queries

    console.log('📊 Found messages:', messages.length);

    // Group by conversation partner and listing (optimized)
    const conversationMap = new Map();
    
    for (const message of messages) {
      const isCurrentUserSender = message.sender._id.toString() === currentUserId.toString();
      const otherUser = isCurrentUserSender ? message.receiver : message.sender;
      const listingId = message.listing?._id?.toString() || 'general';
      const key = `${otherUser._id}_${listingId}`;
      
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          user: otherUser,
          listing: message.listing,
          lastMessage: message,
          unreadCount: 0,
          totalMessages: 0
        });
      }
      
      const conversation = conversationMap.get(key);
      conversation.totalMessages++;
      
      // Count unread messages (only count messages received by current user)
      if (!isCurrentUserSender && !message.read) {
        conversation.unreadCount++;
      }
    }

    // Convert to array and sort by last message time
    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    console.log('📊 Processed conversations:', conversations.length);

    res.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Mark messages as read for a specific listing
router.put('/read/:userId/:listingId', auth, async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    const currentUserId = req.user.id;

    // Build query for marking messages as read
    let query = {
      sender: userId,
      receiver: currentUserId,
      read: false
    };

    // If listingId is not 'undefined', filter by listing
    if (listingId && listingId !== 'undefined') {
      query.listing = listingId;
    }

    await Message.updateMany(query, { read: true });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Mark messages as read (general conversation)
router.put('/read/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;