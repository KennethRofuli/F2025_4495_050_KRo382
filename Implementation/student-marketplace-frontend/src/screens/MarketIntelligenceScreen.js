import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { pricingAPI, categoriesAPI } from '../services/api';

const MarketIntelligenceScreen = ({ navigation }) => {
  const [marketData, setMarketData] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      // Fetch both market overview and category data
      const [marketResult, categoriesResult] = await Promise.all([
        pricingAPI.getMarketOverview(),
        categoriesAPI.getCategories()
      ]);
      
      if (marketResult.success) {
        setMarketData(marketResult.data);
      }
      
      if (categoriesResult.success) {
        setCategories(categoriesResult.data.categories || []);
      }
    } catch (error) {
      console.error('Market data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarketData();
  };

  const getCategoryIcon = (categoryName) => {
    // Try to find the category in our dynamic list first
    const categoryData = categories.find(cat => cat.name === categoryName);
    if (categoryData && categoryData.icon) {
      return categoryData.icon;
    }
    
    // Fallback to hardcoded icons for backward compatibility
    const legacyIcons = {
      'Textbooks': '📚',
      'Electronics': '💻',
      'Furniture': '🪑',
      'Clothing': '👕',
      'Sports': '⚽',
      'Toys': '🧸'
    };
    return legacyIcons[categoryName] || '📦';
  };

  const getInsightIcon = (insightType) => {
    const icons = {
      'market_opportunity': '💡',
      'market_saturation': '📊',
      'seasonal': '📅',
      'depreciation': '📉'
    };
    return icons[insightType] || '🧠';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Analyzing market data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>🤖 Market Intelligence</Text>
          <Text style={styles.subtitle}>AI-powered market analysis and insights</Text>
        </View>

      {Object.entries(marketData).map(([category, data]) => (
        <View key={category} style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryTitleContainer}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
              <Text style={styles.categoryTitle}>{category}</Text>
            </View>
            <View style={styles.listingCount}>
              <Text style={styles.countText}>{data.totalListings}</Text>
              <Text style={styles.countLabel}>items</Text>
            </View>
          </View>

          <View style={styles.priceInfo}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Average Price</Text>
              <Text style={styles.priceValue}>${data.averagePrice}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Price Range</Text>
              <Text style={styles.priceValue}>
                ${data.priceRange.min} - ${data.priceRange.max}
              </Text>
            </View>
          </View>

          {data.insights && data.insights.length > 0 && (
            <View style={styles.insightsContainer}>
              <Text style={styles.insightsTitle}>AI Insights</Text>
              {data.insights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <Text style={styles.insightIcon}>
                    {getInsightIcon(insight.type)}
                  </Text>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightText}>{insight.message}</Text>
                    <View style={styles.confidenceContainer}>
                      <Text style={styles.confidenceText}>
                        {Math.round(insight.confidence * 100)}% confidence
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          AI analysis updates every time new listings are added
        </Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh Analysis</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  listingCount: {
    alignItems: 'center',
  },
  countText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  countLabel: {
    fontSize: 12,
    color: '#666',
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  insightsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
  },
  confidenceContainer: {
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 11,
    color: '#007bff',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
};

export default MarketIntelligenceScreen;