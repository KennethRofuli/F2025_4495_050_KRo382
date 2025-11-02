import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserRatingDisplay = ({ 
  averageRating = 0, 
  totalRatings = 0, 
  sellerRating = 0,
  buyerRating = 0,
  sellerTransactions = 0,
  buyerTransactions = 0,
  showDetailed = false,
  size = 'medium'
}) => {
  const StarDisplay = ({ rating, count, size }) => {
    const starSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;
    const fontSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;
    
    return (
      <View style={styles.starDisplay}>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.floor(rating) ? 'star' : 
                    star <= rating ? 'star-half' : 'star-outline'}
              size={starSize}
              color="#FFD700"
              style={styles.star}
            />
          ))}
        </View>
        <Text style={[styles.ratingText, { fontSize }]}>
          {rating > 0 ? rating.toFixed(1) : 'No ratings'}
        </Text>
        {count > 0 && (
          <Text style={[styles.countText, { fontSize: fontSize - 2 }]}>
            ({count})
          </Text>
        )}
      </View>
    );
  };

  if (!showDetailed) {
    return (
      <StarDisplay 
        rating={averageRating} 
        count={totalRatings} 
        size={size}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.overallRating}>
        <Text style={styles.sectionTitle}>User Rating</Text>
        <StarDisplay 
          rating={averageRating} 
          count={totalRatings} 
          size="large"
        />
      </View>

      {(sellerTransactions > 0 && buyerTransactions > 0) && (
        <View style={styles.detailedRatings}>
          <View style={styles.ratingSection}>
            <Text style={styles.subsectionTitle}>As Seller</Text>
            <StarDisplay 
              rating={sellerRating} 
              count={sellerTransactions} 
              size="small"
            />
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.subsectionTitle}>As Buyer</Text>
            <StarDisplay 
              rating={buyerRating} 
              count={buyerTransactions} 
              size="small"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const RatingBadge = ({ rating, totalRatings, style }) => {
  const getBadgeColor = (rating) => {
    if (rating >= 4.5) return '#4CAF50'; // Green
    if (rating >= 4.0) return '#8BC34A'; // Light Green
    if (rating >= 3.5) return '#FFC107'; // Yellow
    if (rating >= 3.0) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const badgeStyle = [
    styles.badge,
    { backgroundColor: getBadgeColor(rating) },
    style
  ];

  return (
    <View style={badgeStyle}>
      <Ionicons name="star" size={12} color="white" />
      <Text style={styles.badgeText}>
        {rating > 0 ? rating.toFixed(1) : 'New'}
      </Text>
      {totalRatings > 0 && (
        <Text style={styles.badgeCount}>({totalRatings})</Text>
      )}
    </View>
  );
};

const TrustLevel = ({ rating, totalRatings }) => {
  const getTrustLevel = (rating, count) => {
    if (count === 0) return { level: 'New User', color: '#999' };
    if (rating >= 4.8 && count >= 50) return { level: 'Trusted Seller', color: '#4CAF50' };
    if (rating >= 4.5 && count >= 20) return { level: 'Reliable', color: '#8BC34A' };
    if (rating >= 4.0 && count >= 10) return { level: 'Good Standing', color: '#FFC107' };
    if (rating >= 3.5) return { level: 'Average', color: '#FF9800' };
    return { level: 'Below Average', color: '#F44336' };
  };

  const trustInfo = getTrustLevel(rating, totalRatings);

  return (
    <View style={[styles.trustBadge, { borderColor: trustInfo.color }]}>
      <Text style={[styles.trustText, { color: trustInfo.color }]}>
        {trustInfo.level}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailedRatings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ratingSection: {
    alignItems: 'center',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 5,
  },
  starDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  countText: {
    color: '#666',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  badgeCount: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
  },
  trustBadge: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  trustText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export { UserRatingDisplay, RatingBadge, TrustLevel };