import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listingsAPI } from '../services/api';
import { myListingsStyles } from '../styles/MyListingsStyles';
import EditListingModal from '../components/EditListingModal';
import AddListingModal from '../components/AddListingModal';

const MyListingsScreen = ({ navigation }) => {
  const [myListings, setMyListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    try {
      const result = await listingsAPI.getMyListings();
      if (result.success) {
        setMyListings(result.data);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load your listings');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadMyListings();
  };

  const handleDeleteListing = (listingId, title) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteListing(listingId),
        },
      ]
    );
  };

  const deleteListing = async (listingId) => {
    try {
      const result = await listingsAPI.deleteListing(listingId);
      if (result.success) {
        setMyListings(prevListings => 
          prevListings.filter(listing => listing._id !== listingId)
        );
        Alert.alert('Success', 'Listing deleted successfully');
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete listing');
    }
  };

  const handleEditListing = (listing) => {
    setSelectedListing(listing);
    setIsEditModalVisible(true);
  };

  const handleListingUpdated = (updatedListing) => {
    setMyListings(prevListings =>
      prevListings.map(listing =>
        listing._id === updatedListing._id ? updatedListing : listing
      )
    );
    setIsEditModalVisible(false);
    setSelectedListing(null);
  };

  const handleListingAdded = (newListing) => {
    setMyListings(prevListings => [newListing, ...prevListings]);
    setIsAddModalVisible(false);
  };

  const formatPrice = (price) => {
    return `$${price?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderListing = (listing) => (
    <View key={listing._id} style={myListingsStyles.listingCard}>
      {listing.photo ? (
        <Image 
          source={{ uri: listing.photo }} 
          style={myListingsStyles.listingImage}
          defaultSource={require('../../assets/icon.png')}
          onError={() => console.log('Image failed to load')}
        />
      ) : (
        <View style={myListingsStyles.placeholderImage}>
          <Text style={myListingsStyles.placeholderText}>No Image</Text>
        </View>
      )}
      <View style={myListingsStyles.cardContent}>
        <View style={myListingsStyles.cardHeader}>
          <Text style={myListingsStyles.listingTitle}>{listing.title}</Text>
          <View style={myListingsStyles.actionsContainer}>
            <TouchableOpacity 
              style={myListingsStyles.editButton}
              onPress={() => handleEditListing(listing)}
            >
              <Text style={myListingsStyles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={myListingsStyles.deleteButton}
              onPress={() => handleDeleteListing(listing._id, listing.title)}
            >
              <Text style={myListingsStyles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={myListingsStyles.listingDescription} numberOfLines={2}>
          {listing.description}
        </Text>
        <View style={myListingsStyles.listingFooter}>
          <Text style={myListingsStyles.listingPrice}>{formatPrice(listing.price)}</Text>
          <View style={myListingsStyles.listingMeta}>
            <Text style={myListingsStyles.listingCategory}>{listing.category}</Text>
            <Text style={myListingsStyles.listingDate}>
              {formatDate(listing.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={myListingsStyles.container}>
      {/* Header */}
      <View style={myListingsStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={myListingsStyles.backButton}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={myListingsStyles.headerTitle}>My Listings</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={myListingsStyles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={myListingsStyles.loadingContainer}>
            <Text style={myListingsStyles.loadingText}>Loading your listings...</Text>
          </View>
        ) : myListings.length === 0 ? (
          <View style={myListingsStyles.emptyContainer}>
            <Text style={myListingsStyles.emptyText}>No listings yet</Text>
            <Text style={myListingsStyles.emptySubtext}>
              Create your first listing to get started!
            </Text>
            <TouchableOpacity 
              style={myListingsStyles.createListingButton}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Text style={myListingsStyles.createListingButtonText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#2c3e50', marginBottom: 16 }}>
              {myListings.length} listing{myListings.length !== 1 ? 's' : ''}
            </Text>
            {myListings.map(renderListing)}
          </View>
        )}
      </ScrollView>

      {/* Edit Listing Modal */}
      <EditListingModal
        visible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
        onListingUpdated={handleListingUpdated}
      />

      {/* Add Listing Modal */}
      <AddListingModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onListingAdded={handleListingAdded}
      />
    </SafeAreaView>
  );
};

export default MyListingsScreen;