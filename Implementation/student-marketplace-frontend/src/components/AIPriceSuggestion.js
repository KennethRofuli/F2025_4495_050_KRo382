import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { pricingAPI } from '../services/api';

const AIPriceSuggestion = ({ 
  title, 
  description, 
  category, 
  condition, 
  age,
  onPriceSelect,
  style 
}) => {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (title && category && title.length > 3) {
      fetchPriceSuggestion();
    }
  }, [title, category, condition, age]);

  const fetchPriceSuggestion = async () => {
    setLoading(true);
    
    try {
      const result = await pricingAPI.getPriceSuggestion({
        title,
        description,
        category,
        condition,
        age
      });
      
      if (result.success && result.data.suggestedPrice) {
        setSuggestion(result.data);
        
        // Animate in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        setSuggestion(null);
      }
    } catch (error) {
      console.error('Price suggestion error:', error);
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceSelect = (price) => {
    if (onPriceSelect) {
      onPriceSelect(price.toString());
    }
  };

  const getConfidenceStars = (confidence) => {
    const stars = Math.round(confidence * 5);
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return '#4CAF50'; // Green
    if (confidence >= 0.7) return '#FF9800'; // Orange
    return '#9E9E9E'; // Gray
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007bff" />
          <Text style={styles.loadingText}>Getting AI price suggestion...</Text>
        </View>
      </View>
    );
  }

  if (!suggestion) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.aiIcon}>
          <Text style={styles.aiIconText}>🤖</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>AI Price Suggestion</Text>
          <View style={styles.confidenceContainer}>
            <Text style={[styles.confidence, { color: getConfidenceColor(suggestion.confidence) }]}>
              {getConfidenceStars(suggestion.confidence)} {Math.round(suggestion.confidence * 100)}%
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => setExpanded(!expanded)}
          style={styles.expandButton}
        >
          <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.priceSection}>
        <TouchableOpacity 
          style={styles.suggestedPriceButton}
          onPress={() => handlePriceSelect(suggestion.suggestedPrice)}
        >
          <Text style={styles.suggestedPriceLabel}>Recommended</Text>
          <Text style={styles.suggestedPrice}>${suggestion.suggestedPrice}</Text>
        </TouchableOpacity>

        <View style={styles.priceRange}>
          <TouchableOpacity 
            style={styles.rangeButton}
            onPress={() => handlePriceSelect(suggestion.priceRange.min)}
          >
            <Text style={styles.rangeLabel}>Min</Text>
            <Text style={styles.rangePrice}>${suggestion.priceRange.min}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.rangeButton}
            onPress={() => handlePriceSelect(suggestion.priceRange.max)}
          >
            <Text style={styles.rangeLabel}>Max</Text>
            <Text style={styles.rangePrice}>${suggestion.priceRange.max}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.marketContext}>
            <Text style={styles.marketLabel}>Market Position</Text>
            <Text style={styles.marketValue}>{suggestion.marketContext.marketPosition}</Text>
          </View>
          
          <View style={styles.reasoning}>
            <Text style={styles.reasoningLabel}>Analysis</Text>
            <Text style={styles.reasoningText}>{suggestion.reasoning}</Text>
          </View>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Similar Items</Text>
              <Text style={styles.statValue}>{suggestion.marketContext.similarItems}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Category Avg</Text>
              <Text style={styles.statValue}>${suggestion.marketContext.categoryAverage}</Text>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = {
  container: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3f2fd',
    padding: 16,
    marginVertical: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiIconText: {
    fontSize: 18,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidence: {
    fontSize: 12,
    fontWeight: '500',
  },
  expandButton: {
    padding: 4,
  },
  expandIcon: {
    fontSize: 14,
    color: '#666',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  suggestedPriceButton: {
    flex: 2,
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  suggestedPriceLabel: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 2,
  },
  suggestedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  priceRange: {
    flex: 1,
    gap: 6,
  },
  rangeButton: {
    backgroundColor: '#e8f4fd',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 1,
  },
  rangePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  marketContext: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketLabel: {
    fontSize: 14,
    color: '#666',
  },
  marketValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reasoning: {
    marginBottom: 12,
  },
  reasoningLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  reasoningText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
};

export default AIPriceSuggestion;