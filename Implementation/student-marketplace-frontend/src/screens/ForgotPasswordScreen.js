import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { passwordResetAPI } from '../services/api';
import { colors, spacing, typography, borderRadius, commonStyles } from '../styles/CommonStyles';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const [loading, setLoading] = useState(false);
  
  const handleSendResetEmail = async () => {
    // Validate email
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const userEmail = email.trim().toLowerCase();
      
      console.log('📧 Sending password reset email...');
      const result = await passwordResetAPI.initiateReset(userEmail);
      
      if (result.success) {
        Alert.alert(
          'Email Sent!',
          `A password reset link has been sent to ${userEmail}. Please check your email and follow the instructions to reset your password.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Reset email error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={80} color="#007AFF" />
          </View>

          <Text style={styles.title}>Forgot Your Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Send Reset Email Button */}
          <Button
            mode="contained"
            onPress={handleSendResetEmail}
            loading={loading}
            disabled={loading}
            style={{ borderRadius: 8, marginBottom: 30 }}
            contentStyle={{ paddingVertical: 8 }}
            buttonColor="#3498db"
          >
            Send Reset Email
          </Button>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backToLoginText}>
              Remember your password? <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    ...commonStyles.screenHeader,
  },
  backButton: {
    ...commonStyles.backButton,
  },
  headerTitle: {
    ...commonStyles.screenHeaderTitle,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.huge + spacing.xs,
    paddingBottom: spacing.xxxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.huge,
  },
  inputContainer: {
    marginBottom: spacing.xxxl,
  },
  inputLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    ...commonStyles.input,
    borderRadius: borderRadius.xl,
  },
  backToLoginButton: {
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: typography.semiBold,
  },
});

export default ForgotPasswordScreen;