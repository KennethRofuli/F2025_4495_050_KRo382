import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { messagingAPI, authAPI } from '../services/api';
import realTimeService from '../services/realTimeService';
import MessagingModal from '../components/MessagingModal';
import { useFocusEffect } from '@react-navigation/native';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMessagingModal, setShowMessagingModal] = useState(false);

  useEffect(() => {
    initializeScreen();
  }, []);

  // Use focus effect to properly manage real-time service
  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused - start real-time service
      connectRealTime();
      
      return () => {
        // Screen is unfocused - stop real-time service
        console.log('📱 MessagesScreen unfocused, stopping real-time service');
        realTimeService.stopPolling();
        realTimeService.removeAllListeners();
      };
    }, [])
  );

  const connectRealTime = async () => {
    console.log('🔄 Starting real-time messaging service');
    
    // Start polling for new messages (with authentication check)
    await realTimeService.startPolling(3000); // Check every 3 seconds
    
    // Listen for new messages
    realTimeService.onMessage((message, status) => {
      if (status === 'new') {
        console.log('📨 New message detected in MessagesScreen:', message);
        // Refresh conversations when new message arrives
        loadConversations();
      }
    });
  };

  const initializeScreen = async () => {
    const userId = await authAPI.getCurrentUserId();
    setCurrentUserId(userId);
    loadConversations();
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const result = await messagingAPI.getConversations();
      
      if (result.success) {
        setConversations(result.data.conversations || []);
      } else {
        console.error('Failed to load conversations:', result.error);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const openConversation = (conversation) => {
    // Use the actual listing from the conversation, or create a general conversation object
    const conversationListing = conversation.listing || {
      _id: 'general',
      title: 'General Conversation',
      price: 0,
      seller: conversation.user
    };
    
    setSelectedConversation({
      listing: conversationListing,
      receiverId: conversation.user._id,
      listingId: conversation.listing?._id || null
    });
    setShowMessagingModal(true);
  };

  const formatLastMessage = (message) => {
    if (!message.content) return 'No messages';
    return message.content.length > 50 
      ? message.content.substring(0, 50) + '...'
      : message.content;
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversation = ({ item: conversation }) => {
    const hasUnread = conversation.unreadCount > 0;
    
    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          hasUnread && styles.unreadConversation,
          !conversation.listing && styles.disabledConversation
        ]}
        onPress={conversation.listing ? () => openConversation(conversation) : null}
        disabled={!conversation.listing}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {conversation.user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {hasUnread && <View style={styles.unreadDot} />}
        </View>
        
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[
              styles.userName,
              hasUnread && styles.unreadText
            ]}>
              {conversation.user.name}
            </Text>
            <Text style={styles.messageTime}>
              {formatMessageTime(conversation.lastMessage.createdAt)}
            </Text>
          </View>
          
          {/* Show listing context if available */}
          {conversation.listing ? (
            <Text style={styles.listingContext}>
              About: {conversation.listing.title}
            </Text>
          ) : (
            <Text style={styles.noListingContext}>
              Listing no longer available
            </Text>
          )}
          
          <Text style={[
            styles.lastMessage,
            hasUnread && styles.unreadText
          ]}>
            {formatLastMessage(conversation.lastMessage)}
          </Text>
          
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#999" 
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Conversations List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation by messaging a seller about their listing
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.user._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={styles.conversationsList}
        />
      )}

      {/* Messaging Modal */}
      {selectedConversation && (
        <MessagingModal
          visible={showMessagingModal}
          onClose={() => {
            setShowMessagingModal(false);
            setSelectedConversation(null);
            // Refresh conversations when closing modal
            onRefresh();
          }}
          listing={selectedConversation.listing}
          currentUserId={currentUserId}
          receiverId={selectedConversation.receiverId}
        />
      )}
    </SafeAreaView>
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
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 34, // Same width as back button for centering
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadConversation: {
    backgroundColor: '#f8f9ff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
    marginRight: 10,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  listingContext: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadText: {
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    position: 'absolute',
    right: 0,
    top: 25,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledConversation: {
    opacity: 0.5,
  },
  noListingContext: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 2,
  },
};

export default MessagesScreen;