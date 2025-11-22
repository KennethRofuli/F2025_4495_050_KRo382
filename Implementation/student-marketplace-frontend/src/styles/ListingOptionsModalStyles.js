import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from './CommonStyles';

export const listingOptionsModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    padding: spacing.xxl,
    ...shadows.heavy,
  },
  listingPreview: {
    marginBottom: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: typography.md,
    fontWeight: typography.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  listingPrice: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  sellerName: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  actionsContainer: {
    marginBottom: spacing.lg,
  },
  messageButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  messageButtonText: {
    color: colors.white,
    fontSize: typography.md,
    fontWeight: typography.semiBold,
  },
  reportButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  reportButtonText: {
    color: colors.white,
    fontSize: typography.md,
    fontWeight: typography.semiBold,
  },
  cancelButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: typography.md,
    fontWeight: typography.semiBold,
  },
});