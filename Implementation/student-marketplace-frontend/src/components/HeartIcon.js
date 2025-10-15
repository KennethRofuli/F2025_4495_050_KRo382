import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { favoritesAPI } from '../services/api';

const HeartIcon = ({ listingId, isOwnListing = false, style, onFavoriteChange }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only check favorite status if it's not the user's own listing
    if (listingId && !isOwnListing) {
      checkFavoriteStatus();
    }
  }, [listingId, isOwnListing]);

  const checkFavoriteStatus = async () => {
    try {
      const result = await favoritesAPI.checkFavorite(listingId);
      if (result.success) {
        setIsFavorited(result.data.isFavorited);
      }
    } catch (error) {
      console.log('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (isLoading || isOwnListing) return;
    
    setIsLoading(true);
    
    try {
      let result;
      if (isFavorited) {
        result = await favoritesAPI.removeFavorite(listingId);
      } else {
        result = await favoritesAPI.addFavorite(listingId);
      }

      if (result.success) {
        const newFavoriteStatus = !isFavorited;
        setIsFavorited(newFavoriteStatus);
        
        // Callback for parent component updates
        if (onFavoriteChange) {
          onFavoriteChange(listingId, newFavoriteStatus);
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render heart icon for own listings
  if (isOwnListing) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[defaultStyles.heartButton, style]}
      onPress={toggleFavorite}
      disabled={isLoading}
    >
      <Text style={[defaultStyles.heartIcon, { opacity: isLoading ? 0.5 : 1 }]}>
        {isFavorited ? '❤️' : '🤍'}
      </Text>
    </TouchableOpacity>
  );
};

const defaultStyles = {
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heartIcon: {
    fontSize: 18,
  },
};

export default HeartIcon;