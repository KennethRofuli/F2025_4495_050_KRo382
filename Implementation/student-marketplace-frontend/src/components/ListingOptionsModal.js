import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { listingOptionsModalStyles } from '../styles/ListingOptionsModalStyles';
import { reportsAPI, listingsAPI } from '../services/api';

const ListingOptionsModal = ({ visible, onClose, listing, currentUserId, onListingUpdated }) => {
  const isOwner = listing?.seller?._id === currentUserId;

  const handleMessageSeller = () => {
    onClose();
    
    if (isOwner) {
      Alert.alert('Info', 'You cannot message yourself');
      return;
    }
    
    // TODO: Implement messaging functionality
    Alert.alert('Message Seller', `Coming soon! You want to message ${listing.seller.name} about "${listing.title}"`);
  };

  const handleEditListing = () => {
    onClose();
    // TODO: Navigate to edit listing screen
    Alert.alert('Edit Listing', 'Edit listing functionality coming soon!');
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

  if (!listing) return null;

  const formatPrice = (price) => {
    return price ? `$${price.toLocaleString()}` : 'Price not specified';
  };

  return (
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
  );
};

export default ListingOptionsModal;