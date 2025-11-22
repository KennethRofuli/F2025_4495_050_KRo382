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
import { colors, spacing, typography, borderRadius, shadows } from '../styles/CommonStyles';

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
    backgroundColor: colors.backgroundSecondary,
  },
  headerContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: typography.md,
    color: colors.primary,
    fontWeight: typography.semiBold,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.md,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: 0,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  categoryCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: typography.xxl,
    marginRight: spacing.md,
  },
  categoryTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semiBold,
    color: colors.textPrimary,
  },
  listingCount: {
    alignItems: 'center',
  },
  countText: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  countLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  priceValue: {
    fontSize: typography.md,
    fontWeight: typography.semiBold,
    color: colors.textPrimary,
  },
  insightsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.backgroundTertiary,
    paddingTop: spacing.lg,
  },
  insightsTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  insightIcon: {
    fontSize: typography.md,
    marginRight: spacing.md,
    marginTop: spacing.xxs,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  confidenceContainer: {
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: typography.sm,
    fontWeight: typography.semiBold,
  },
};

export default MarketIntelligenceScreen;