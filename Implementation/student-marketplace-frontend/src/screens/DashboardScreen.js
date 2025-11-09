import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listingsAPI, authAPI, tokenManager } from '../services/api';
import { imageUtils } from '../utils/helpers';
import AddListingModal from '../components/AddListingModal';
import HeartIcon from '../components/HeartIcon';
import { RatingBadge } from '../components/RatingDisplay';
import FloatingMessageButton from '../components/FloatingMessageButton';
import MessagesModal from '../components/MessagesModal';
import ListingOptionsModal from '../components/ListingOptionsModal';
import { dashboardStyles } from '../styles/DashboardStyles';

const DashboardScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [messageRefreshTrigger, setMessageRefreshTrigger] = useState(0);

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

  const getCurrentUser = async () => {
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
  };

  const loadListings = async () => {
    try {
      const result = await listingsAPI.getAllListings();
      if (result.success) {
        setListings(result.data);
        setFilteredListings(result.data);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load listings');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadListings();
  };

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

  const handleProfile = () => {
    setIsMenuVisible(false);
    navigation.navigate('Profile');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredListings(listings);
      return;
    }

    const filtered = listings.filter(listing => 
      listing.title.toLowerCase().includes(query.toLowerCase()) ||
      listing.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredListings(filtered);
  };

  const handleListingAdded = (newListing) => {
    const updatedListings = [newListing, ...listings];
    setListings(updatedListings);
    setFilteredListings(updatedListings);
    setIsAddModalVisible(false);
  };

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
            <Text style={dashboardStyles.listingPrice}>{formatPrice(listing.price)}</Text>
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
        <TouchableOpacity onPress={handleLogout} style={{ paddingHorizontal: 15, paddingVertical: 8, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 20 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={dashboardStyles.searchContainer}>
        <TextInput
          style={dashboardStyles.searchInput}
          placeholder="Search by title or category..."
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Listings */}
      <FlatList
        data={filteredListings}
        renderItem={({ item }) => renderListing(item)}
        keyExtractor={(item) => item._id}
        contentContainerStyle={filteredListings.length === 0 ? dashboardStyles.scrollContainer : null}
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
      />

      {/* Floating Message Button */}
      <FloatingMessageButton
        onPress={() => setShowMessagesModal(true)}
        refreshTrigger={messageRefreshTrigger}
      />

      {/* Messages Modal */}
      <MessagesModal
        visible={showMessagesModal}
        onClose={() => {
          setShowMessagesModal(false);
          // Trigger refresh of floating button after a small delay to avoid blocking UI
          setTimeout(() => {
            setMessageRefreshTrigger(prev => prev + 1);
          }, 100);
        }}
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;