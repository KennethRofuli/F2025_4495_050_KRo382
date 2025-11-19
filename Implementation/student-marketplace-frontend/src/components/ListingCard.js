import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { imageUtils } from '../utils/helpers';
import HeartIcon from './HeartIcon';
import { RatingBadge } from './RatingDisplay';
import DealScoreBadge from './DealScoreBadge';
import { dashboardStyles } from '../styles/DashboardStyles';

// Memoized listing card component for better FlatList performance
const ListingCard = memo(({ 
  listing, 
  currentUserId, 
  onPress, 
  onLongPress 
}) => {
  return (
    <TouchableOpacity
      style={dashboardStyles.listingCard}
      onPress={() => onPress(listing)}
      onLongPress={() => onLongPress(listing)}
      activeOpacity={0.8}
    >
      {/* Image */}
      {listing.image ? (
        <Image
          source={{ uri: imageUtils.getImageUri(listing.image) }}
          style={dashboardStyles.listingImage}
          resizeMode="cover"
          // Performance optimizations
          fadeDuration={200}
          progressiveRenderingEnabled={true}
        />
      ) : (
        <View style={dashboardStyles.placeholderImage}>
          <Text style={dashboardStyles.placeholderText}>No Image</Text>
        </View>
      )}

      {/* Content */}
      <View style={dashboardStyles.cardContent}>
        {/* Title */}
        <Text style={dashboardStyles.listingTitle} numberOfLines={2}>
          {listing.title}
        </Text>

        {/* Description */}
        <Text style={dashboardStyles.listingDescription} numberOfLines={2}>
          {listing.description}
        </Text>

        {/* Footer with price and meta info */}
        <View style={dashboardStyles.listingFooter}>
          {/* Price and Deal Badge */}
          <View style={dashboardStyles.priceSection}>
            <Text style={dashboardStyles.listingPrice}>
              ${listing.price}
            </Text>
            <View style={dashboardStyles.dealBadge}>
              <DealScoreBadge dealScore={listing.dealScore} />
            </View>
          </View>

          {/* Meta info */}
          <View style={dashboardStyles.listingMeta}>
            <Text style={dashboardStyles.listingCategory}>
              {listing.category}
            </Text>
            <Text style={dashboardStyles.listingDate}>
              {new Date(listing.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Seller info with rating */}
        <View style={dashboardStyles.sellerSection}>
          <Text style={dashboardStyles.sellerName}>
            by {listing.seller?.name || 'Unknown Seller'}
          </Text>
          {listing.seller?.averageRating && (
            <View style={dashboardStyles.sellerRating}>
              <RatingBadge rating={listing.seller.averageRating} />
            </View>
          )}
        </View>

        {/* Heart Icon */}
        <HeartIcon
          listingId={listing._id}
          currentUserId={currentUserId}
          style={{ position: 'absolute', top: 8, right: 8 }}
        />
      </View>
    </TouchableOpacity>
  );
});

// Custom comparison function for better memoization
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.listing._id === nextProps.listing._id &&
    prevProps.listing.title === nextProps.listing.title &&
    prevProps.listing.price === nextProps.listing.price &&
    prevProps.listing.dealScore === nextProps.listing.dealScore &&
    prevProps.currentUserId === nextProps.currentUserId
  );
};

ListingCard.displayName = 'ListingCard';

export default memo(ListingCard, areEqual);