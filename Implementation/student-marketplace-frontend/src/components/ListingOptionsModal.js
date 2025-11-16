import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Platform,
  Dimensions,
  BackHandler,
  SafeAreaView,
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
  const [showReportModal, setShowReportModal] = useState(false);

  // Load existing rating when modal opens
  useEffect(() => {
    if (visible && listing && !isOwner) {
      loadExistingRating();
    } else if (!visible) {
      // Reset state when modal closes
      setSelectedRating(0);
      setExistingRating(null);
      setShowReportModal(false);
    }
  }, [visible, listing, isOwner]);

  // Handle Android back button for report modal
  useEffect(() => {
    if (Platform.OS === 'android' && showReportModal) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        setShowReportModal(false);
        return true; // Prevent default back behavior
      });
      
      return () => backHandler.remove();
    }
  }, [showReportModal]);

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
    setShowReportModal(true);
  };

  const submitReport = async (reason) => {
    setShowReportModal(false);
    onClose();
    
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

  const ReportModal = () => {
    const screenHeight = Dimensions.get('window').height;
    const maxModalHeight = screenHeight * 0.7; // 70% of screen height
    
    const reportOptions = [
      { label: '🚫 Inappropriate Content', value: 'inappropriate_content' },
      { label: '📧 Spam', value: 'spam' },
      { label: '⚠️ Scam/Suspicious', value: 'scam_suspicious' },
      { label: '🎭 Fake Listing', value: 'fake_listing' },
      { label: '💬 Offensive Language', value: 'offensive_language' },
      { label: '🚷 Prohibited Item', value: 'prohibited_item' },
      { label: '📝 Other', value: 'other' },
    ];

    return (
      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <TouchableOpacity 
          style={reportModalStyles.overlay}
          activeOpacity={1}
          onPress={() => setShowReportModal(false)}
        >
          <View style={[
            reportModalStyles.modalContainer,
            Platform.OS === 'android' && { maxHeight: maxModalHeight }
          ]}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <SafeAreaView>
                <Text style={reportModalStyles.title}>Report Listing</Text>
                <Text style={reportModalStyles.subtitle}>
                  Why are you reporting this listing?
                </Text>
                
                <ScrollView 
                  style={[
                    reportModalStyles.optionsScrollView,
                    Platform.OS === 'android' && { 
                      maxHeight: maxModalHeight * 0.6 
                    }
                  ]}
                  showsVerticalScrollIndicator={Platform.OS === 'android'}
                  bounces={Platform.OS === 'ios'}
                >
                  {reportOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        reportModalStyles.reportOption,
                        index === reportOptions.length - 1 && reportModalStyles.lastOption
                      ]}
                      onPress={() => submitReport(option.value)}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <Text style={reportModalStyles.reportOptionText}>
                        {option.label}
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <TouchableOpacity
                  style={reportModalStyles.cancelButton}
                  onPress={() => setShowReportModal(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={reportModalStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </SafeAreaView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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

    {/* Report Modal */}
    <ReportModal />
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

// Report Modal Styles
const reportModalStyles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Bottom sheet style for better Android experience
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  optionsScrollView: {
    paddingHorizontal: 20,
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 18 : 15, // Larger touch targets for Android
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    minHeight: Platform.OS === 'android' ? 56 : 44, // Material Design minimum touch target
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  reportOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  cancelButton: {
    margin: 20,
    paddingVertical: Platform.OS === 'android' ? 16 : 14,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: Platform.OS === 'android' ? 48 : 44,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
};

export default ListingOptionsModal;