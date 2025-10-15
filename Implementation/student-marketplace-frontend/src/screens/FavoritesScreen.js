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
import { favoritesAPI, authAPI } from '../services/api';
import AddListingModal from '../components/AddListingModal';
import HeartIcon from '../components/HeartIcon';
import ListingOptionsModal from '../components/ListingOptionsModal';
import { dashboardStyles } from '../styles/DashboardStyles';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadFavorites();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const userId = await authAPI.getCurrentUserId();
    setCurrentUserId(userId);
  };

  const loadFavorites = async () => {
    try {
      const result = await favoritesAPI.getFavorites();
      if (result.success) {
        // Make sure we're accessing the correct data structure
        const favoritesData = result.data.data || [];
        setFavorites(favoritesData);
        setFilteredFavorites(favoritesData);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load favorites');
      console.error('Load favorites error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadFavorites();
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

  const handleDashboard = () => {
    setIsMenuVisible(false);
    navigation.navigate('Dashboard');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredFavorites(favorites);
      return;
    }

    const filtered = favorites.filter(listing =>
      listing.title.toLowerCase().includes(query.toLowerCase()) ||
      listing.description.toLowerCase().includes(query.toLowerCase()) ||
      listing.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredFavorites(filtered);
  };

  const handleListingAdded = (newListing) => {
    // No need to add to favorites automatically, user can heart it
    setIsAddModalVisible(false);
  };

  const handleRemoveFromFavorites = async (listingId) => {
    try {
      const result = await favoritesAPI.removeFavorite(listingId);
      if (result.success) {
        // Remove from local state
        const updatedFavorites = favorites.filter(listing => listing._id !== listingId);
        setFavorites(updatedFavorites);
        setFilteredFavorites(updatedFavorites);
        // Don't show alert, let the heart icon provide feedback
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove from favorites');
    }
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

  const renderFavoriteListing = (listing) => {
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
            onError={() => console.log('Image failed to load')}
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
            <Text style={dashboardStyles.sellerName}>by {listing.seller.name}</Text>
          )}
        </View>
        
        {/* Heart Icon for Favorites */}
        <HeartIcon 
          listingId={listing._id} 
          isOwnListing={listing.seller?._id === currentUserId}
          onFavoriteChange={(listingId, isFavorited) => {
            if (!isFavorited) {
              // If unfavorited, remove from local list
              handleRemoveFromFavorites(listingId);
            }
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={dashboardStyles.container}>
      {/* Header */}
      <View style={dashboardStyles.header}>
        <TouchableOpacity onPress={handleMenuPress} style={dashboardStyles.menuButton}>
          <Text style={{ color: '#fff', fontSize: 18 }}>☰</Text>
        </TouchableOpacity>
        <Text style={dashboardStyles.headerTitle}>My Favorites</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={dashboardStyles.searchContainer}>
        <TextInput
          style={dashboardStyles.searchInput}
          placeholder="Search favorites..."
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Content */}
      <FlatList
        data={filteredFavorites}
        renderItem={({ item }) => renderFavoriteListing(item)}
        keyExtractor={(item) => item._id}
        contentContainerStyle={filteredFavorites.length === 0 ? dashboardStyles.scrollContainer : null}
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
              <Text style={dashboardStyles.emptyText}>Loading favorites...</Text>
            ) : searchQuery ? (
              <>
                <Text style={dashboardStyles.emptyText}>No results found</Text>
                <Text style={dashboardStyles.emptySubtext}>
                  Try a different search term
                </Text>
              </>
            ) : (
              <>
                <Text style={dashboardStyles.emptyText}>No favorites yet</Text>
                <Text style={dashboardStyles.emptySubtext}>
                  Start adding listings to your favorites by tapping the heart icon!
                </Text>
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
              onPress={handleDashboard}
            >
              <Text style={dashboardStyles.modalItemText}>🏠 Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={dashboardStyles.modalItem} 
              onPress={handleMyListings}
            >
              <Text style={dashboardStyles.modalItemText}>📝 My Listings</Text>
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
      />
    </SafeAreaView>
  );
};

const styles = {
  // Remove old styles as we're using dashboardStyles now
};

export default FavoritesScreen;