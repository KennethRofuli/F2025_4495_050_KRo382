import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from './CommonStyles';

export const addListingModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '100%',
    maxHeight: '90%',
    ...shadows.heavy,
  },
  
  // Header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  modalTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.dark,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: typography.xxl,
    color: colors.gray,
    fontWeight: typography.bold,
  },
  
  // Scroll container
  scrollContainer: {
    flexGrow: 1,
  },
  
  // Form
  form: {
    marginBottom: spacing.xxl,
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
    backgroundColor: colors.placeholder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descriptionInput: {
    height: 100,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  
  // Category picker
  categoryPicker: {
    backgroundColor: colors.placeholder,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Image section
  imageSection: {
    marginBottom: spacing.xxl,
  },
  imageContainer: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: typography.md,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  changeImageButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  changeImageButtonText: {
    color: colors.white,
    fontSize: typography.sm,
    fontWeight: typography.semiBold,
  },
  removeImageButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  removeImageButtonText: {
    color: colors.white,
    fontSize: typography.sm,
    fontWeight: typography.semiBold,
  },
  
  // Image picker modal
  imagePickerModal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginHorizontal: spacing.xl,
    ...shadows.heavy,
  },
  imagePickerTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.dark,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  imagePickerOption: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  imagePickerOptionLast: {
    borderBottomWidth: 0,
  },
  imagePickerOptionText: {
    fontSize: typography.md,
    color: colors.dark,
    textAlign: 'center',
    fontWeight: typography.medium,
  },
  imagePickerCancel: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  imagePickerCancelText: {
    fontSize: typography.md,
    color: colors.danger,
    textAlign: 'center',
    fontWeight: typography.semiBold,
  },
  
  // Action buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.dark,
    fontSize: typography.lg,
    fontWeight: typography.semiBold,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.lg,
    fontWeight: typography.semiBold,
  },
  submitButtonDisabled: {
    backgroundColor: colors.extraLightGray,
  },
  submitButtonTextDisabled: {
    color: colors.gray,
  },
});