import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Image,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { messagingAPI, authAPI } from '../services/api';
import { colors } from '../styles/CommonStyles';
import realTimeService from '../services/realTimeService';
import MessagingModal from '../components/MessagingModal';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  
  // Use safe area insets for proper positioning
  const insets = useSafeAreaInsets();

  useEffect(() => {
    initializeScreen();
  }, []);

  // Force layout recalculation on screen focus to handle navigation timing
  useFocusEffect(
    React.useCallback(() => {
      // Small delay to ensure safe area insets are properly calculated
      const timeout = setTimeout(() => {
        // Force a minimal re-render to apply correct positioning
        setLoading(prev => prev);
      }, 100);
      return () => clearTimeout(timeout);
    }, [])
  );

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
    await realTimeService.startPolling(15000); // Check every 15 seconds
    
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

  const loadConversations = async (retryCount = 0) => {
    try {
      setLoading(true);
      
      // Check network connectivity first
      const userId = await authAPI.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const result = await messagingAPI.getConversations();
      
      if (result.success) {
        const conversations = result.data?.conversations || [];
        setConversations(conversations);
        console.log('📱 Loaded conversations:', conversations.length);
      } else {
        console.error('❌ API returned error:', result.error);
        
        // Retry up to 2 times on failure
        if (retryCount < 2) {
          console.log(`🔄 Retrying conversation load (${retryCount + 1}/2)...`);
          setTimeout(() => loadConversations(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        setConversations([]);
        Alert.alert(
          'Connection Issue', 
          'Unable to load messages. Please check your internet connection and try again.',
          [{ text: 'Retry', onPress: () => loadConversations(0) }, { text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Network/Auth error loading conversations:', error);
      
      // Retry on network errors
      if (retryCount < 2 && (error.message.includes('Network') || error.message.includes('timeout'))) {
        console.log(`🔄 Retrying due to network error (${retryCount + 1}/2)...`);
        setTimeout(() => loadConversations(retryCount + 1), 2000 * (retryCount + 1));
        return;
      }
      
      setConversations([]);
      
      // Different error messages based on error type
      if (error.message.includes('authenticated')) {
        Alert.alert(
          'Session Expired',
          'Please log in again to view your messages.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert(
          'Connection Problem',
          'Failed to load messages. Please check your internet connection.',
          [{ text: 'Retry', onPress: () => loadConversations(0) }, { text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadConversations(0); // Always start fresh on manual refresh
    } catch (error) {
      console.log('🔄 Manual refresh completed with errors');
    }
    setRefreshing(false);
  };

  const openConversation = useCallback((conversation) => {
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
  }, []);

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

  const renderConversation = useCallback(({ item: conversation }) => {
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
  }, [currentUserId, openConversation]);

  return (
    <View style={styles.safeAreaContainer}>
      <View style={[styles.statusBarArea, { height: insets.top }]} />
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.container}>
        {/* Header - Always consistent */}
        <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            console.log('Back button pressed'); // Debug log
            try {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Dashboard');
              }
            } catch (error) {
              console.error('Navigation error:', error);
              navigation.navigate('Dashboard');
            }
          }} 
          style={styles.backButton}
          activeOpacity={0.6}
          hitSlop={{ top: 25, bottom: 25, left: 25, right: 25 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.placeholder} />
      </View>

        {/* Content Area - Always uniform */}
        <View style={styles.contentArea}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading conversations...</Text>
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.lightGray} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                Start a conversation by messaging a seller about their listing
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => loadConversations(0)}
              >
                <Text style={styles.retryButtonText}>Refresh Messages</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={conversations}
              renderItem={renderConversation}
              keyExtractor={(item) => `${item.user._id}-${item.listing?._id || 'no-listing'}-${item.lastMessage._id}`}
              getItemLayout={(data, index) => (
                {length: 85, offset: 85 * index, index}
              )}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={15}
              windowSize={10}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              style={styles.conversationsList}
            />
          )}
        </View>

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
      </View>
    </View>
  );
};

const styles = {
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.white, // White status bar area
  },
  statusBarArea: {
    backgroundColor: colors.white, // White status bar background
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
    minHeight: 64,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 1000,
  },
  backButton: {
    padding: 12,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 34, // Same width as back button for centering
  },
  contentArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray,
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
    color: colors.dark,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadConversation: {
    backgroundColor: colors.background,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
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
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.white,
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
    color: colors.dark,
  },
  messageTime: {
    fontSize: 12,
    color: colors.lightGray,
  },
  listingContext: {
    fontSize: 12,
    color: colors.primary,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.gray,
  },
  unreadText: {
    fontWeight: '600',
    color: colors.dark,
  },
  unreadBadge: {
    position: 'absolute',
    right: 0,
    top: 25,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  disabledConversation: {
    opacity: 0.5,
  },
  noListingContext: {
    fontSize: 12,
    color: colors.lightGray,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
};

export default MessagesScreen;