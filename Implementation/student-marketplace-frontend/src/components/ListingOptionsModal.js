import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listingOptionsModalStyles } from '../styles/ListingOptionsModalStyles';
import { reportsAPI, listingsAPI, ratingAPI } from '../services/api';
import MessagingModal from './MessagingModal';

const ListingOptionsModal = ({ visible, onClose, listing, currentUserId, onListingUpdated, onEditListing }) => {
  const isOwner = listing?.seller?._id === currentUserId;
  const [selectedRating, setSelectedRating] = useState(0);
  const [existingRating, setExistingRating] = useState(null);
  const [showMessagingModal, setShowMessagingModal] = useState(false);

  // Load existing rating when modal opens
  useEffect(() => {
    if (visible && listing && !isOwner) {
      loadExistingRating();
    } else if (!visible) {
      // Reset state when modal closes
      setSelectedRating(0);
      setExistingRating(null);
    }
  }, [visible, listing, isOwner]);

  const loadExistingRating = async () => {
    try {
      // Create a transaction ID based on listing, current user, and seller (matches backend format)
      const transactionId = `${listing._id}_${currentUserId}_${listing.seller._id}`;
      console.log('🔍 Loading existing rating for transaction:', transactionId);
      
      const result = await ratingAPI.getTransactionRating(transactionId);
      console.log('📊 Rating API result:', result);
      
      if (result.success && result.data) {
        console.log('✅ Found existing rating:', result.data.rating);
        setExistingRating(result.data);
        setSelectedRating(result.data.rating);
      } else {
        console.log('❌ No existing rating found');
        setExistingRating(null);
        setSelectedRating(0);
      }
    } catch (error) {
      console.log('💥 Error loading existing rating:', error);
      setExistingRating(null);
      setSelectedRating(0);
    }
  };

  const handleMessageSeller = () => {
    onClose();
    
    if (isOwner) {
      Alert.alert('Info', 'You cannot message yourself');
      return;
    }
    
    setShowMessagingModal(true);
  };

  const handleEditListing = () => {
    onClose();
    if (onEditListing) {
      onEditListing(listing);
    } else {
      Alert.alert('Edit Listing', 'Edit listing functionality not available in this context.');
    }
  };

  const handleDeleteListing = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: confirmDeleteListing 
        },
      ]
    );
  };

  const confirmDeleteListing = async () => {
    try {
      const result = await listingsAPI.deleteListing(listing._id);
      
      if (result.success) {
        Alert.alert('Success', 'Listing deleted successfully');
        onClose();
        // Notify parent component to refresh listings
        if (onListingUpdated) {
          onListingUpdated();
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete listing. Please try again.');
    }
  };

  const handleReportListing = () => {
    // Close modal first
    onClose();
    
    // Show report options
    Alert.alert(
      'Report Listing',
      'Why are you reporting this listing?',
      [
        { text: 'Inappropriate Content', onPress: () => submitReport('inappropriate_content') },
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Scam/Suspicious', onPress: () => submitReport('scam_suspicious') },
        { text: 'Fake Listing', onPress: () => submitReport('fake_listing') },
        { text: 'Offensive Language', onPress: () => submitReport('offensive_language') },
        { text: 'Prohibited Item', onPress: () => submitReport('prohibited_item') },
        { text: 'Other', onPress: () => submitReport('other') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const submitReport = async (reason) => {
    try {
      const result = await reportsAPI.submitReport(listing._id, reason);
      
      if (result.success) {
        Alert.alert('Report Submitted', 'Thank you for your report. We will review it shortly.');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const handleStarPress = async (rating) => {
    if (isOwner) {
      return; // Silently do nothing for own listings
    }

    console.log('⭐ User clicked star rating:', rating);
    setSelectedRating(rating);
    
    try {
      const transactionId = `${listing._id}_${currentUserId}_${listing.seller._id}`;
      console.log('🔄 Submitting rating with transactionId:', transactionId);
      
      const result = await ratingAPI.createRating({
        ratedUserId: listing.seller._id,
        listingId: listing._id,
        transactionId: transactionId,
        rating: rating,
        review: '', // No review for quick star rating
        ratingType: 'seller',
        categories: {
          communication: rating,
          reliability: rating,
          itemCondition: rating,
          timeliness: rating
        }
      });
      
      console.log('💾 Rating submission result:', result);
      
      if (result.success) {
        console.log('✅ Rating submitted successfully');
        // Update existing rating state
        setExistingRating(result.data);
        // No alert - silent success for better UX
      } else {
        console.log('❌ Rating submission failed:', result.error);
        Alert.alert('Error', result.error);
        // Reset to previous rating on error
        if (existingRating) {
          setSelectedRating(existingRating.rating);
        } else {
          setSelectedRating(0);
        }
      }
    } catch (error) {
      console.log('💥 Rating submission error:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
      // Reset to previous rating on error
      if (existingRating) {
        setSelectedRating(existingRating.rating);
      } else {
        setSelectedRating(0);
      }
    }
  };

  const StarRating = () => {
    if (isOwner) return null; // Don't show stars for own listings
    
    return (
      <View style={starRatingStyles.container}>
        <Text style={starRatingStyles.title}>
          {existingRating ? 'Your rating:' : 'Rate this seller:'}
        </Text>
        <View style={starRatingStyles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleStarPress(star)}
              style={starRatingStyles.starButton}
            >
              <Ionicons
                name={star <= selectedRating ? 'star' : 'star-outline'}
                size={30}
                color={star <= selectedRating ? '#FFD700' : '#DDD'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {selectedRating > 0 && (
          <Text style={starRatingStyles.ratingText}>
            {existingRating ? 'Tap to change your rating' : `${selectedRating} star${selectedRating > 1 ? 's' : ''}`}
          </Text>
        )}
      </View>
    );
  };

  if (!listing) return null;

  const formatPrice = (price) => {
    return price ? `$${price.toLocaleString()}` : 'Price not specified';
  };

  return (
    <>
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={listingOptionsModalStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={listingOptionsModalStyles.modalContainer}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            {/* Listing Preview */}
            <View style={listingOptionsModalStyles.listingPreview}>
              <Text style={listingOptionsModalStyles.listingTitle} numberOfLines={2}>
                {listing.title || 'No Title'}
              </Text>
              <Text style={listingOptionsModalStyles.listingPrice}>
                {formatPrice(listing.price)}
              </Text>
              <Text style={listingOptionsModalStyles.sellerName}>
                Seller: {listing.seller?.name || 'Unknown'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={listingOptionsModalStyles.actionsContainer}>
              {isOwner ? (
                // Owner actions
                <>
                  <TouchableOpacity 
                    style={[listingOptionsModalStyles.messageButton, { backgroundColor: '#3498db' }]}
                    onPress={handleEditListing}
                  >
                    <Text style={listingOptionsModalStyles.messageButtonText}>
                      📝 Edit Listing
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[listingOptionsModalStyles.reportButton, { backgroundColor: '#e74c3c' }]}
                    onPress={handleDeleteListing}
                  >
                    <Text style={listingOptionsModalStyles.reportButtonText}>
                      🗑️ Delete Listing
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Non-owner actions
                <>
                  {/* Star Rating Section */}
                  <StarRating />

                  <TouchableOpacity 
                    style={listingOptionsModalStyles.messageButton}
                    onPress={handleMessageSeller}
                  >
                    <Text style={listingOptionsModalStyles.messageButtonText}>
                      💬 Message Seller
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={listingOptionsModalStyles.reportButton}
                    onPress={handleReportListing}
                  >
                    <Text style={listingOptionsModalStyles.reportButtonText}>
                      🚨 Report Listing
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Cancel Button */}
            <TouchableOpacity 
              style={listingOptionsModalStyles.cancelButton}
              onPress={onClose}
            >
              <Text style={listingOptionsModalStyles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>

    {/* Messaging Modal */}
    <MessagingModal
      visible={showMessagingModal}
      onClose={() => setShowMessagingModal(false)}
      listing={listing}
      currentUserId={currentUserId}
      receiverId={listing?.seller?._id}
    />
  </>
  );
};

// Star Rating Styles
const starRatingStyles = {
  container: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  starButton: {
    paddingHorizontal: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
};

export default ListingOptionsModal;