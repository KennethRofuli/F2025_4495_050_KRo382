import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { pricingAPI } from '../services/api';

const DealScoreBadge = ({ listingId, price, category, style }) => {
  const [dealScore, setDealScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealScore();
  }, [listingId]);

  const fetchDealScore = async () => {
    try {
      const result = await pricingAPI.getDealScore(listingId);
      if (result.success) {
        setDealScore(result.data);
      }
    } catch (error) {
      console.error('Deal score error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dealScore) {
    return null;
  }

  const getBadgeConfig = (score) => {
    switch (score) {
      case 'hot-deal':
        return {
          icon: '🔥',
          text: 'Hot Deal',
          backgroundColor: '#ff4444',
          textColor: '#ffffff'
        };
      case 'good-deal':
        return {
          icon: '💰',
          text: 'Good Deal',
          backgroundColor: '#ff8800',
          textColor: '#ffffff'
        };
      case 'fair-price':
        return {
          icon: '✅',
          text: 'Fair Price',
          backgroundColor: '#4CAF50',
          textColor: '#ffffff'
        };
      case 'overpriced':
        return {
          icon: '⚠️',
          text: 'Above Average',
          backgroundColor: '#ff9800',
          textColor: '#ffffff'
        };
      case 'very-overpriced':
        return {
          icon: '❌',
          text: 'Overpriced',
          backgroundColor: '#f44336',
          textColor: '#ffffff'
        };
      default:
        return null;
    }
  };

  const badgeConfig = getBadgeConfig(dealScore.score);
  
  if (!badgeConfig) {
    return null;
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeConfig.backgroundColor }, style]}>
      <Text style={styles.icon}>{badgeConfig.icon}</Text>
      <Text style={[styles.text, { color: badgeConfig.textColor }]}>
        {badgeConfig.text}
      </Text>
      {dealScore.confidence >= 0.8 && (
        <View style={styles.confidenceIndicator}>
          <Text style={styles.confidenceText}>
            {Math.round(dealScore.confidence * 100)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  confidenceIndicator: {
    marginLeft: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  confidenceText: {
    fontSize: 9,
    color: '#ffffff',
    fontWeight: '500',
  },
};

export default DealScoreBadge;