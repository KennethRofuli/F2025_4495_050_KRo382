import { StyleSheet } from 'react-native';

// Design Tokens
export const colors = {
  // Primary colors
  primary: '#3498db',
  primaryDark: '#2980b9',
  primaryLight: '#d4e9f7',
  
  // Secondary colors
  secondary: '#34495e',
  success: '#27ae60',
  warning: '#f39c12',
  warningAlt: '#FF6B35',
  danger: '#e74c3c',
  dangerDark: '#dc3545',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  dark: '#2c3e50',
  gray: '#7f8c8d',
  grayMedium: '#666',
  lightGray: '#95a5a6',
  extraLightGray: '#bdc3c7',
  background: '#f8f9fa',
  backgroundLight: '#f5f5f5',
  border: '#e1e8ed',
  borderLight: '#ddd',
  borderLighter: '#eee',
  placeholder: '#ecf0f1',
  textPrimary: '#333',
  textSecondary: '#666',
  textDisabled: '#999',
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
  none: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  light: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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

// Paper Theme Configuration (for React Native Paper)
export const paperTheme = {
  colors: {
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.white,
    error: colors.danger,
    onPrimary: colors.white,
    onSecondary: colors.white,
    onBackground: colors.dark,
    onSurface: colors.dark,
  },
  roundness: borderRadius.md,
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
  
  // Common screen layouts
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLighter,
  },
  screenHeaderTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semiBold,
    color: colors.textPrimary,
  },
  backButton: {
    padding: spacing.xs,
  },
  
  // Section styles
  section: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLighter,
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.xl,
    fontWeight: typography.semiBold,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: typography.xxl,
    color: colors.gray,
    fontWeight: typography.normal,
  },
});