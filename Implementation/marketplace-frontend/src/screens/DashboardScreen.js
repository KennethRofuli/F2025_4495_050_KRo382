import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listingsAPI, authAPI } from '../services/api';
import AddListingModal from '../components/AddListingModal';
import { dashboardStyles } from '../styles/DashboardStyles';

const DashboardScreen = ({ navigation }) => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadListings();
  }, []);

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
    return `$${price?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderListing = (listing) => (
    <View key={listing._id} style={dashboardStyles.listingCard}>
      {listing.photo ? (
        <Image 
          source={{ uri: listing.photo }} 
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
      </View>
    </View>
  );

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
      <ScrollView
        style={dashboardStyles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={dashboardStyles.loadingContainer}>
            <Text style={dashboardStyles.loadingText}>Loading listings...</Text>
          </View>
        ) : filteredListings.length === 0 ? (
          <View style={dashboardStyles.emptyContainer}>
            {searchQuery ? (
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
        ) : (
          <View>
            {filteredListings.map(renderListing)}
          </View>
        )}
      </ScrollView>

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
              style={dashboardStyles.modalItem} 
              onPress={handleMyListings}
            >
              <Text style={dashboardStyles.modalItemText}>📝 My Listings</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default DashboardScreen;