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
import { listingsAPI, authAPI } from '../services/api';
import { dashboardStyles } from '../styles/DashboardStyles';
import EditListingModal from '../components/EditListingModal';
import AddListingModal from '../components/AddListingModal';
import ListingOptionsModal from '../components/ListingOptionsModal';
import HeartIcon from '../components/HeartIcon';

const MyListingsScreen = ({ navigation }) => {
  const [myListings, setMyListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    loadMyListings();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const userId = await authAPI.getCurrentUserId();
    setCurrentUserId(userId);
  };

  const loadMyListings = async () => {
    try {
      const result = await listingsAPI.getMyListings();
      if (result.success) {
        setMyListings(result.data);
        setFilteredListings(result.data);
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

  const handleDashboard = () => {
    setIsMenuVisible(false);
    navigation.navigate('Dashboard');
  };

  const handleFavorites = () => {
    setIsMenuVisible(false);
    navigation.navigate('Favorites');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredListings(myListings);
      return;
    }

    const filtered = myListings.filter(listing =>
      listing.title.toLowerCase().includes(query.toLowerCase()) ||
      listing.description.toLowerCase().includes(query.toLowerCase()) ||
      listing.category.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredListings(filtered);
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
        const updatedListings = myListings.filter(listing => listing._id !== listingId);
        setMyListings(updatedListings);
        setFilteredListings(updatedListings);
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
    const updatedListings = myListings.map(listing =>
      listing._id === updatedListing._id ? updatedListing : listing
    );
    setMyListings(updatedListings);
    setFilteredListings(updatedListings);
    setIsEditModalVisible(false);
    setSelectedListing(null);
  };

  const handleListingAdded = (newListing) => {
    const updatedListings = [newListing, ...myListings];
    setMyListings(updatedListings);
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

  const renderListing = (listing) => {
    // Determine which image source to use (new imageUrl or legacy photo)
    const imageSource = listing.imageUrl || listing.photo;
    
    return (
      <View key={listing._id} style={dashboardStyles.listingCard}>
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
          <View style={styles.cardHeader}>
            <Text style={dashboardStyles.listingTitle}>{listing.title}</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => handleEditListing(listing)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteListing(listing._id, listing.title)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
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
        
        {/* Heart Icon for Favorites - Hidden for own listings */}
        <HeartIcon listingId={listing._id} isOwnListing={true} />
      </View>
    );
  };

  return (
    <SafeAreaView style={dashboardStyles.container}>
      {/* Header */}
      <View style={dashboardStyles.header}>
        <TouchableOpacity onPress={handleMenuPress} style={dashboardStyles.menuButton}>
          <Text style={{ color: '#fff', fontSize: 18 }}>☰</Text>
        </TouchableOpacity>
        <Text style={dashboardStyles.headerTitle}>📝 My Listings</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={dashboardStyles.searchContainer}>
        <TextInput
          style={dashboardStyles.searchInput}
          placeholder="Search my listings..."
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Content */}
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
              <Text style={dashboardStyles.emptyText}>Loading your listings...</Text>
            ) : searchQuery ? (
              <>
                <Text style={dashboardStyles.emptyText}>No results found</Text>
                <Text style={dashboardStyles.emptySubtext}>
                  Try a different search term
                </Text>
              </>
            ) : (
              <>
                <Text style={dashboardStyles.emptyText}>No listings yet</Text>
                <Text style={dashboardStyles.emptySubtext}>
                  Create your first listing to get started!
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
              onPress={handleFavorites}
            >
              <Text style={dashboardStyles.modalItemText}>❤️ Favorites</Text>
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
        onListingUpdated={loadMyListings}
      />
    </SafeAreaView>
  );
};

const styles = {
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
};

export default MyListingsScreen;