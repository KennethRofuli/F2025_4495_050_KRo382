import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from './CommonStyles';

export const myListingsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header
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
  backButton: {
    padding: spacing.sm,
  },
  
  // Content
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.md,
    color: colors.gray,
  },
  
  // Empty state
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
    marginBottom: spacing.xl,
  },
  createListingButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  createListingButtonText: {
    color: colors.white,
    fontSize: typography.md,
    fontWeight: typography.semiBold,
  },
  
  // Listing card
  listingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.medium,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  listingTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.dark,
    flex: 1,
    marginRight: spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  editButtonText: {
    color: colors.white,
    fontWeight: typography.semiBold,
    fontSize: typography.xs,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: typography.semiBold,
    fontSize: typography.xs,
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
});