import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { messagingAPI } from '../services/api';
import { useCurrentUser } from '../hooks/useCurrentUser';

const FloatingMessageButton = ({ onPress, refreshTrigger }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isLoading, setIsLoading] = useState(false);
  
  const { currentUserId } = useCurrentUser();

  useEffect(() => {
    if (currentUserId) {
      loadUnreadCount();
      // Set up interval to check for new messages every 10 seconds (more frequent)
      const interval = setInterval(loadUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  // Refresh when refreshTrigger changes (with minimal debouncing)
  useEffect(() => {
    if (currentUserId && refreshTrigger) {
      // Minimal debounce for responsiveness
      const timeoutId = setTimeout(() => {
        loadUnreadCount();
      }, 25);
      return () => clearTimeout(timeoutId);
    }
  }, [refreshTrigger, currentUserId]);

  const loadUnreadCount = async () => {
    // Prevent multiple concurrent calls
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const result = await messagingAPI.getConversations();
      if (result.success) {
        const totalUnread = result.data.conversations?.reduce(
          (total, conv) => total + conv.unreadCount, 
          0
        ) || 0;
        
        if (totalUnread !== unreadCount) {
          const oldCount = unreadCount;
          setUnreadCount(totalUnread);
          
          // Animate button when new messages arrive
          if (totalUnread > oldCount) {
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.2,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubbles" size={24} color="#fff" />
        
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = {
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
};

export default FloatingMessageButton;