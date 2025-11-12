import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { messagingAPI } from '../services/api';
import socketService from '../services/socketService';

const MessagingModal = ({ 
  visible, 
  onClose, 
  listing, 
  currentUserId,
  receiverId 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (visible && receiverId) {
      loadMessages();
      setupSocketListeners();
    }
    
    return () => {
      cleanupSocketListeners();
    };
  }, [visible, receiverId]);

  const setupSocketListeners = () => {
    // Listen for new messages
    const unsubscribeMessages = socketService.onMessage((message, status, error) => {
      if (status === 'error') {
        console.error('Socket message error:', error);
        return;
      }
      
      if (message) {
        console.log('📨 New message received in modal:', message);
        
        // Check if this message is for the current conversation
        const isForThisConversation = 
          (message.sender._id === receiverId && message.receiver._id === currentUserId) ||
          (message.sender._id === currentUserId && message.receiver._id === receiverId);
        
        const isForThisListing = !listing?._id || message.listing?._id === listing._id;
        
        if (isForThisConversation && isForThisListing) {
          setMessages(prev => {
            // Avoid duplicates
            const exists = prev.some(msg => msg._id === message._id);
            if (!exists) {
              return [...prev, message];
            }
            return prev;
          });
          
          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    });

    // Listen for typing indicators
    const unsubscribeTyping = socketService.onTyping((data) => {
      if (data.senderId === receiverId) {
        setOtherUserTyping(data.isTyping);
      }
    });

    // Return cleanup functions
    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  };

  const cleanupSocketListeners = () => {
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const loadMessages = async (showLoading = true) => {
    // Prevent multiple concurrent calls
    if (loading && showLoading) return;
    
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const result = await messagingAPI.getConversation(receiverId, listing?._id);
      if (result.success) {
        setMessages(result.data.messages || []);
        
        // Mark messages as read after loading (don't wait for completion)
        markMessagesAsRead();
      } else {
        console.error('Failed to load messages:', result.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const markMessagesAsRead = async () => {
    try {
      const result = await messagingAPI.markAsRead(receiverId, listing?._id);
      if (!result.success) {
        console.error('Failed to mark messages as read:', result.error);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const result = await messagingAPI.sendMessage(
        receiverId, 
        messageContent, 
        listing._id
      );
      
      if (result.success) {
        // If sent via socket, the message will be added via socket listener
        // If sent via API, add to local state
        if (result.method === 'api') {
          const sentMessage = result.data.message || result.data;
          setMessages(prev => [...prev, sentMessage]);
        }
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', result.error);
        // Restore message text on error
        setNewMessage(messageContent);
      }
      
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message');
      // Restore message text on error
      setNewMessage(messageContent);
    }
  };

  const handleMessageChange = (text) => {
    setNewMessage(text);
    
    // Send typing indicators
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      socketService.sendTyping(receiverId, true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      socketService.sendTyping(receiverId, false);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendTyping(receiverId, false);
    }, 1000);
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender._id === currentUserId || item.sender === currentUserId;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        <Text style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.theirMessageText
        ]}>
          {item.content}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  if (!listing) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {listing.title}
            </Text>
            <Text style={styles.headerSubtitle}>
              ${listing.price} • {listing.seller?.name}
            </Text>
          </View>
        </View>

        {/* Listing Info Card */}
        <View style={styles.listingCard}>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {listing.title}
          </Text>
          <Text style={styles.listingPrice}>
            ${listing.price?.toLocaleString()}
          </Text>
          <Text style={styles.sellerName}>
            Seller: {listing.seller?.name}
          </Text>
        </View>

        {/* Messages */}
        <View style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Start a conversation about this item
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item._id}
              style={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}
          
          {/* Typing Indicator */}
          {otherUserTyping && (
            <View style={styles.typingContainer}>
              <Text style={styles.typingText}>
                {listing.seller?.name || 'User'} is typing...
              </Text>
            </View>
          )}
        </View>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={handleMessageChange}
            placeholder="Type a message..."
            multiline
            maxHeight={100}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={newMessage.trim() ? "#fff" : "#999"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  closeButton: {
    padding: 5,
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  listingCard: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 5,
  },
  sellerName: {
    fontSize: 14,
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 15,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 15,
    paddingBottom: 30, // More space from bottom
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  typingContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  typingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  unavailableCard: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  unavailableTitle: {
    color: '#999',
    fontStyle: 'italic',
  },
  unavailablePrice: {
    color: '#999',
  },
};

export default MessagingModal;