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
import realTimeService from '../services/realTimeService';

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
  const flatListRef = useRef(null);
  const lastMessageCount = useRef(0);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    if (visible && receiverId) {
      loadMessages();
      setupRealTimePolling();
    }
    
    return () => {
      // Clean up polling interval when component unmounts or modal closes
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [visible, receiverId]);

  const setupRealTimePolling = () => {
    // Clear any existing interval first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Store initial message count
    lastMessageCount.current = messages.length;
    
    // Set up a focused polling for this conversation
    pollingIntervalRef.current = setInterval(async () => {
      if (visible) {
        await loadMessages(false); // Load without showing loading spinner
      }
    }, 2000); // Check every 2 seconds for this conversation
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
        const newMessages = result.data.messages || [];
        
        // Check if we have new messages
        if (newMessages.length > lastMessageCount.current) {
          console.log('📨 New messages detected in conversation');
          // Auto-scroll to bottom for new messages
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
        
        setMessages(newMessages);
        lastMessageCount.current = newMessages.length;
        
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
      const result = await realTimeService.sendMessage(
        receiverId, 
        messageContent, 
        listing._id
      );
      
      if (result.success) {
        console.log('✅ Message sent successfully');
        const sentMessage = result.data.message || result.data;
        setMessages(prev => [...prev, sentMessage]);
        lastMessageCount.current += 1;
        
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
        </View>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
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