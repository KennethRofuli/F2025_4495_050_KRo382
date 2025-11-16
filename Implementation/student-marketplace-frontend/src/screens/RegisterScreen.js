import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../services/api';
import { authStyles } from '../styles/AuthStyles';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [campus, setCampus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !campus) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authAPI.register(name, email, password, campus);
      
      if (result.success) {
        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to login
              navigation.navigate('Login');
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={authStyles.content}>
            {/* Header */}
            <View style={authStyles.headerContainer}>
              <Text style={authStyles.title}>Create Account</Text>
              <Text style={authStyles.subtitle}>Join the Student Marketplace</Text>
            </View>

            {/* Form */}
            <View style={authStyles.formContainer}>
              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>Full Name</Text>
                <TextInput
                  style={authStyles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>Email</Text>
                <TextInput
                  style={authStyles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCompleteType="email"
                />
              </View>

              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>Campus</Text>
                <TextInput
                  style={authStyles.input}
                  placeholder="Enter your campus name"
                  value={campus}
                  onChangeText={setCampus}
                  autoCapitalize="words"
                />
              </View>

              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>Password</Text>
                <TextInput
                  style={authStyles.input}
                  placeholder="Enter your password (min 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCompleteType="off"
                  textContentType="none"
                  passwordRules=""
                />
              </View>

              <View style={authStyles.inputContainer}>
                <Text style={authStyles.label}>Confirm Password</Text>
                <TextInput
                  style={authStyles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCompleteType="off"
                  textContentType="none"
                  passwordRules=""
                />
              </View>

              <View style={authStyles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    authStyles.primaryButton, 
                    isLoading && authStyles.primaryButtonDisabled
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  <Text style={[
                    authStyles.primaryButtonText,
                    isLoading && authStyles.primaryButtonTextDisabled
                  ]}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={authStyles.footerContainer}>
              <Text style={authStyles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={authStyles.linkText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;