import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { UserRatingDisplay, RatingBadge, TrustLevel } from '../components/RatingDisplay';
import { ratingAPI } from '../services/api';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [userStats, setUserStats] = useState(null);
  const [userRatings, setUserRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch rating statistics
      const statsResponse = await ratingAPI.getUserRatingStats(userId);
      if (statsResponse.success) {
        setUserStats(statsResponse.data);
      }
      
      // Fetch recent ratings
      const ratingsResponse = await ratingAPI.getUserRatings(userId, {
        page: 1,
        limit: 10
      });
      if (ratingsResponse.success) {
        setUserRatings(ratingsResponse.data.ratings);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading user profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Info Section */}
      <View style={styles.userSection}>
        <Text style={styles.userName}>John Doe</Text>
        
        {/* Trust Level Badge */}
        {userStats && (
          <TrustLevel 
            rating={userStats.averageRating} 
            totalRatings={userStats.totalRatings} 
          />
        )}
        
        {/* Rating Display */}
        {userStats && (
          <UserRatingDisplay
            averageRating={userStats.averageRating}
            totalRatings={userStats.totalRatings}
            sellerRating={userStats.sellerRating}
            buyerRating={userStats.buyerRating}
            sellerTransactions={userStats.sellerTransactions}
            buyerTransactions={userStats.buyerTransactions}
            showDetailed={true}
          />
        )}
      </View>

      {/* Recent Reviews Section */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Recent Reviews</Text>
        {userRatings.length > 0 ? (
          userRatings.map((rating) => (
            <View key={rating._id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>
                  {rating.raterUser.name}
                </Text>
                <RatingBadge 
                  rating={rating.rating} 
                  totalRatings={null}
                  style={styles.reviewBadge}
                />
              </View>
              
              <Text style={styles.reviewType}>
                Rated as {rating.ratingType}
              </Text>
              
              {rating.review && (
                <Text style={styles.reviewText}>
                  "{rating.review}"
                </Text>
              )}
              
              <Text style={styles.reviewDate}>
                {new Date(rating.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noReviews}>No reviews yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  reviewsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewBadge: {
    marginLeft: 10,
  },
  reviewType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  noReviews: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default UserProfileScreen;