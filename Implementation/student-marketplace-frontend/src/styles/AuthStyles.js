import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from './CommonStyles';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Content container
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.huge,
    paddingVertical: spacing.huge,
  },
  
  // Header section
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.huge,
  },
  title: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.lg,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Form section
  formContainer: {
    marginBottom: spacing.xxxl,
  },
  inputContainer: {
    marginBottom: spacing.xxl,
  },
  label: {
    fontSize: typography.md,
    fontWeight: typography.semiBold,
    color: colors.dark,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    fontSize: typography.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.light,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  // Forgot Password section
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.md,
  },
  forgotPasswordText: {
    fontSize: typography.sm,
    color: colors.primary,
    fontWeight: typography.medium,
  },
  
  // Button section
  buttonContainer: {
    marginBottom: spacing.xxxl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.lg,
    fontWeight: typography.semiBold,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.extraLightGray,
  },
  primaryButtonTextDisabled: {
    color: colors.gray,
  },
  
  // Loading state
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: spacing.md,
    color: colors.white,
    fontSize: typography.lg,
    fontWeight: typography.semiBold,
  },
  
  // Footer section
  footerContainer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.md,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  linkText: {
    fontSize: typography.md,
    color: colors.primary,
    fontWeight: typography.semiBold,
    textDecorationLine: 'underline',
  },
  
  // Error handling
  errorContainer: {
    backgroundColor: colors.danger,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xl,
  },
  errorText: {
    color: colors.white,
    fontSize: typography.sm,
    textAlign: 'center',
    fontWeight: typography.medium,
  },
  
  // Success handling
  successContainer: {
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xl,
  },
  successText: {
    color: colors.white,
    fontSize: typography.sm,
    textAlign: 'center',
    fontWeight: typography.medium,
  },
});