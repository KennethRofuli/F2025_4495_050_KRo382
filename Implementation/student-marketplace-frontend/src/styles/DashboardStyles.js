import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from './CommonStyles';

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
  headerTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.white,
  },
  menuButton: {
    padding: spacing.sm,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  modalContent: {
    backgroundColor: colors.white,
    marginTop: 70,
    marginLeft: spacing.xl,
    borderRadius: borderRadius.md,
    minWidth: 200,
    ...shadows.heavy,
  },
  modalItem: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.placeholder,
  },
  modalItemLast: {
    borderBottomWidth: 0,
  },
  modalItemText: {
    fontSize: typography.md,
    color: colors.dark,
    fontWeight: typography.medium,
  },
  
  // Search styles
  searchContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.placeholder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    fontSize: typography.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Content styles
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  scrollContainer: {
    paddingVertical: spacing.lg,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.md,
    color: colors.gray,
  },
  
  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.huge,
  },
  emptyText: {
    fontSize: typography.lg,
    fontWeight: typography.semiBold,
    color: colors.dark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.sm,
    color: colors.gray,
    textAlign: 'center',
  },
  
  // Listing card styles
  listingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    ...shadows.medium,
    // Prevent TouchableOpacity expansion
    transform: [{ scale: 1 }],
  },
  listingImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.placeholder,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.gray,
    fontSize: typography.md,
  },
  cardContent: {
    padding: spacing.md,
  },
  listingTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  listingDescription: {
    fontSize: typography.sm,
    color: colors.gray,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingPrice: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.success,
  },
  listingMeta: {
    alignItems: 'flex-end',
  },
  listingCategory: {
    fontSize: typography.xs,
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  listingDate: {
    fontSize: typography.xs,
    color: colors.lightGray,
  },
  sellerName: {
    fontSize: typography.sm,
    color: colors.gray,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});