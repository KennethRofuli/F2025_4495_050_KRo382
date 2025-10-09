import { StyleSheet } from 'react-native';

// Design Tokens
export const colors = {
  // Primary colors
  primary: '#3498db',
  primaryDark: '#2980b9',
  
  // Secondary colors
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  dark: '#2c3e50',
  gray: '#7f8c8d',
  lightGray: '#95a5a6',
  extraLightGray: '#bdc3c7',
  background: '#f8f9fa',
  border: '#e1e8ed',
  placeholder: '#ecf0f1',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  
  // Font weights
  normal: '400',
  medium: '500',
  semiBold: '600',
  bold: 'bold',
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 20,
  round: 25,
};

export const shadows = {
  light: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medium: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  heavy: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
};

// Common/Shared Styles
export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  
  // Headers
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
  
  // Buttons
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.lg,
    fontWeight: typography.semiBold,
  },
  successButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  successButtonText: {
    color: colors.white,
    fontSize: typography.lg,
    fontWeight: typography.semiBold,
  },
  dangerButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  dangerButtonText: {
    color: colors.white,
    fontWeight: typography.semiBold,
    fontSize: typography.xs,
  },
  warningButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  warningButtonText: {
    color: colors.white,
    fontWeight: typography.semiBold,
    fontSize: typography.xs,
  },
  
  // Inputs
  input: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.md,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
  },
  
  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  cardContent: {
    padding: spacing.md,
  },
  
  // Text styles
  title: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.gray,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  price: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.success,
  },
  category: {
    fontSize: typography.xs,
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: typography.xs,
    color: colors.lightGray,
  },
  
  // Loading and empty states
  loadingText: {
    fontSize: typography.md,
    color: colors.gray,
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
  
  // Form styles
  inputContainer: {
    marginBottom: spacing.xxl,
  },
  label: {
    fontSize: typography.md,
    fontWeight: typography.semiBold,
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  
  // Disabled states
  disabled: {
    backgroundColor: colors.extraLightGray,
  },
  disabledText: {
    color: colors.gray,
  },
});