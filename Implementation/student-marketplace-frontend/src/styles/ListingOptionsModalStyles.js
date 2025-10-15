import { StyleSheet } from 'react-native';

const colors = {
  primary: '#007AFF',
  danger: '#FF3B30',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const typography = {
  sm: 14,
  md: 16,
  lg: 18,
  semiBold: '600',
  bold: '700',
};

const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const listingOptionsModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  listingPreview: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.sm,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: typography.md,
    fontWeight: typography.semiBold,
    color: colors.black,
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
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  actionsContainer: {
    marginBottom: spacing.md,
  },
  messageButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  messageButtonText: {
    color: colors.white,
    fontSize: typography.md,
    fontWeight: typography.semiBold,
  },
  reportButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  reportButtonText: {
    color: colors.white,
    fontSize: typography.md,
    fontWeight: typography.semiBold,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
  },
  cancelButtonText: {
    color: colors.gray,
    fontSize: typography.md,
    fontWeight: typography.semiBold,
  },
});