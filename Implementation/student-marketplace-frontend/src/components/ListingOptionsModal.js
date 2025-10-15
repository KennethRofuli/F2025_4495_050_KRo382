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

const ListingOptionsModal = ({ visible, onClose, listing, currentUserId }) => {
  const handleMessageSeller = () => {
    // Close modal first
    onClose();
    
    // Check if user is trying to message themselves
    if (listing.seller._id === currentUserId) {
      Alert.alert('Info', 'You cannot message yourself');
      return;
    }
    
    // TODO: Implement messaging functionality
    Alert.alert('Message Seller', `Coming soon! You want to message ${listing.seller.name} about "${listing.title}"`);
  };

  const handleReportListing = () => {
    // Close modal first
    onClose();
    
    // TODO: Implement report functionality
    Alert.alert('Report Listing', `Coming soon! You want to report "${listing.title}"`);
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
              <TouchableOpacity 
                style={listingOptionsModalStyles.messageButton}
                onPress={handleMessageSeller}
              >
                <Text style={listingOptionsModalStyles.messageButtonText}>
                  Message Seller
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={listingOptionsModalStyles.reportButton}
                onPress={handleReportListing}
              >
                <Text style={listingOptionsModalStyles.reportButtonText}>
                  Report Listing
                </Text>
              </TouchableOpacity>
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