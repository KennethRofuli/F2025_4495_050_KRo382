import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listingsAPI, authAPI, tokenManager } from '../services/api';
import { imageUtils } from '../utils/helpers';
import { debounce } from '../utils/performance';
import AddListingModal from '../components/AddListingModal';
import HeartIcon from '../components/HeartIcon';
import { RatingBadge } from '../components/RatingDisplay';
import DealScoreBadge from '../components/DealScoreBadge';

import ListingOptionsModal from '../components/ListingOptionsModal';
import EditListingModal from '../components/EditListingModal';
import { dashboardStyles } from '../styles/DashboardStyles';

const DashboardScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadListings();
    getCurrentUser();
  }, []);

  // Add focus listener to refresh user data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getCurrentUser(); // Refresh user data when screen is focused
    });

    return unsubscribe;
  }, [navigation]);

  const getCurrentUser = useCallback(async () => {
    try {
      const userId = await authAPI.getCurrentUserId();
      setCurrentUserId(userId);
      
      // Get user details from token
      const token = await tokenManager.getToken();
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        setCurrentUser(decoded);
      }
    } catch (error) {
      console.log('Error getting user details:', error);
    }
  }, []);

  const loadListings = useCallback(async () => {
    try {
      const result = await listingsAPI.getAllListings();
      if (result.success) {
        setListings(result.data);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load listings');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadListings();
  }, [loadListings]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await authAPI.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const handleAddListing = () => {
    setIsMenuVisible(false);
    setIsAddModalVisible(true);
  };

  const handleMenuPress = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleMyListings = () => {
    setIsMenuVisible(false);
    navigation.navigate('MyListings');
  };

  const handleFavorites = () => {
    setIsMenuVisible(false);
    navigation.navigate('Favorites');
  };

  const handleAdminDashboard = () => {
    setIsMenuVisible(false);
    navigation.navigate('AdminDashboard');
  };

  const handleMarketIntelligence = () => {
    setIsMenuVisible(false);
    navigation.navigate('MarketIntelligence');
  };

  const handleMessages = () => {
    setIsMenuVisible(false);
    navigation.navigate('Messages');
  };

  const handleProfile = () => {
    setIsMenuVisible(false);
    navigation.navigate('Profile');
  };

  const handleEditListing = (listing) => {
    setSelectedListing(listing);
    setIsEditModalVisible(true);
  };

  const handleListingUpdated = (updatedListing) => {
    const updatedListings = listings.map(listing =>
      listing._id === updatedListing._id ? updatedListing : listing
    );
    setListings(updatedListings);
    setFilteredListings(updatedListings);
    setIsEditModalVisible(false);
  };

  // Debounced search to prevent excessive filtering
  const debouncedSearch = useMemo(() => 
    debounce((query) => setSearchQuery(query), 300), []
  );
  
  const handleSearch = useCallback((query) => {
    setSearchInput(query); // Update input immediately for UI
    debouncedSearch(query); // Debounce the actual filtering
  }, [debouncedSearch]);

  // Memoize filtered listings to prevent unnecessary recalculations
  const filteredListingsMemo = useMemo(() => {
    if (!searchQuery.trim()) {
      return listings;
    }

    const query = searchQuery.toLowerCase();
    return listings.filter(listing => 
      listing.title.toLowerCase().includes(query) ||
      listing.category.toLowerCase().includes(query)
    );
  }, [listings, searchQuery]);

  const handleListingAdded = useCallback((newListing) => {
    setListings(prev => [newListing, ...prev]);
    setIsAddModalVisible(false);
  }, []);

  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return `$${numPrice.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleListingPress = (listing) => {
    setSelectedListing(listing);
    setIsOptionsModalVisible(true);
  };

  const renderListing = (listing) => {
    // Determine which image source to use (new imageUrl or legacy photo)
    const imageSource = listing.imageUrl || listing.photo;
    
    return (
      <TouchableOpacity 
        key={listing._id} 
        style={dashboardStyles.listingCard}
        onPress={() => handleListingPress(listing)}
        activeOpacity={0.8}
        delayPressIn={0}
      >
        {imageSource ? (
          <Image 
            source={{ uri: imageSource }} 
            style={dashboardStyles.listingImage}
            defaultSource={require('../../assets/icon.png')}
            onError={imageUtils.onError}
          />
        ) : (
          <View style={dashboardStyles.placeholderImage}>
            <Text style={dashboardStyles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={dashboardStyles.cardContent}>
          <Text style={dashboardStyles.listingTitle}>{listing.title}</Text>
          <Text style={dashboardStyles.listingDescription} numberOfLines={2}>
            {listing.description}
          </Text>
          <View style={dashboardStyles.listingFooter}>
            <View style={dashboardStyles.priceSection}>
              <Text style={dashboardStyles.listingPrice}>{formatPrice(listing.price)}</Text>
              <DealScoreBadge 
                listingId={listing._id}
                price={listing.price}
                category={listing.category}
                style={dashboardStyles.dealBadge}
              />
            </View>
            <View style={dashboardStyles.listingMeta}>
              <Text style={dashboardStyles.listingCategory}>{listing.category}</Text>
              <Text style={dashboardStyles.listingDate}>
                {formatDate(listing.createdAt)}
              </Text>
            </View>
          </View>
          {listing.seller?.name && (
            <View style={dashboardStyles.sellerSection}>
              <Text style={dashboardStyles.sellerName}>by {listing.seller.name}</Text>
              {listing.seller.averageRating > 0 && (
                <RatingBadge 
                  rating={listing.seller.averageRating} 
                  totalRatings={listing.seller.totalRatings}
                  style={dashboardStyles.sellerRating}
                />
              )}
            </View>
          )}
        </View>
        
        {/* Heart Icon for Favorites */}
        <HeartIcon 
          listingId={listing._id} 
          isOwnListing={listing.seller?._id === currentUserId}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={dashboardStyles.container}>
      {/* Header */}
      <View style={dashboardStyles.header}>
        <TouchableOpacity onPress={handleMenuPress} style={dashboardStyles.menuButton}>
          <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold' }}>☰</Text>
        </TouchableOpacity>
        <Text style={dashboardStyles.headerTitle}>Marketplace</Text>
        <TouchableOpacity onPress={handleLogout} style={{ paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#dc3545', borderRadius: 20 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={dashboardStyles.searchContainer}>
        <Searchbar
          placeholder="Search by title or category..."
          value={searchInput}
          onChangeText={handleSearch}
          style={{ backgroundColor: '#fff' }}
          inputStyle={{ minHeight: 0 }}
          elevation={1}
        />
      </View>

      {/* Listings */}
      <FlatList
        data={filteredListingsMemo}
        renderItem={({ item }) => renderListing(item)}
        keyExtractor={(item) => item._id}
        contentContainerStyle={filteredListingsMemo.length === 0 ? dashboardStyles.scrollContainer : null}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        windowSize={5}
        ListEmptyComponent={() => (
          <View style={dashboardStyles.emptyContainer}>
            {isLoading ? (
              <Text style={dashboardStyles.emptyText}>Loading listings...</Text>
            ) : searchQuery ? (
              <>
                <Text style={dashboardStyles.emptyText}>No results found</Text>
                <Text style={dashboardStyles.emptySubtext}>Try searching for something else</Text>
              </>
            ) : (
              <>
                <Text style={dashboardStyles.emptyText}>No listings found</Text>
                <Text style={dashboardStyles.emptySubtext}>Be the first to add a listing!</Text>
              </>
            )}
          </View>
        )}
      />

      {/* Add Listing Modal */}
      <AddListingModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onListingAdded={handleListingAdded}
      />

      {/* Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={dashboardStyles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={dashboardStyles.modalContent}>
            <TouchableOpacity 
              style={[dashboardStyles.modalItem, { borderBottomWidth: 1, borderBottomColor: '#ecf0f1' }]} 
              onPress={handleAddListing}
            >
              <Text style={dashboardStyles.modalItemText}>➕ Add Listing</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[dashboardStyles.modalItem, { borderBottomWidth: 1, borderBottomColor: '#ecf0f1' }]} 
              onPress={handleFavorites}
            >
              <Text style={dashboardStyles.modalItemText}>❤️ Favorites</Text>
            </TouchableOpacity>
            
            {currentUser?.role === 'admin' && (
              <TouchableOpacity 
                style={[dashboardStyles.modalItem, { borderBottomWidth: 1, borderBottomColor: '#ecf0f1' }]} 
                onPress={handleAdminDashboard}
              >
                <Text style={dashboardStyles.modalItemText}>🛡️ Admin Dashboard</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[dashboardStyles.modalItem, { borderBottomWidth: 1, borderBottomColor: '#ecf0f1' }]} 
              onPress={handleMyListings}
            >
              <Text style={dashboardStyles.modalItemText}>📝 My Listings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[dashboardStyles.modalItem, { borderBottomWidth: 1, borderBottomColor: '#ecf0f1' }]} 
              onPress={handleMarketIntelligence}
            >
              <Text style={dashboardStyles.modalItemText}>🤖 Market Intelligence</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[dashboardStyles.modalItem, { borderBottomWidth: 1, borderBottomColor: '#ecf0f1' }]} 
              onPress={handleMessages}
            >
              <Text style={dashboardStyles.modalItemText}>💬 Messages</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={dashboardStyles.modalItem} 
              onPress={handleProfile}
            >
              <Text style={dashboardStyles.modalItemText}>👤 Profile</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Listing Options Modal */}
      <ListingOptionsModal
        visible={isOptionsModalVisible}
        onClose={() => setIsOptionsModalVisible(false)}
        listing={selectedListing}
        currentUserId={currentUserId}
        onListingUpdated={loadListings}
        onEditListing={handleEditListing}
      />

      {/* Edit Listing Modal */}
      <EditListingModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        listing={selectedListing}
        onListingUpdated={handleListingUpdated}
      />

    </SafeAreaView>
  );
};

export default DashboardScreen;