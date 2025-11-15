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
import realTimeService from '../services/realTimeService';
import { authStyles } from '../styles/AuthStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await authAPI.login(email, password);
      
      if (result.success) {
        console.log('✅ User logged in:', result.data.user);
        
        // Start real-time service after successful login
        await realTimeService.startAfterLogin();
        
        // Check if user is admin and redirect accordingly
        if (result.data.user.role === 'admin') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminDashboard' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
          });
        }
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
              <Text style={authStyles.title}>Student Marketplace</Text>
              <Text style={authStyles.subtitle}>Login to your account</Text>
            </View>

            {/* Form */}
            <View style={authStyles.formContainer}>
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
                <Text style={authStyles.label}>Password</Text>
                <TextInput
                  style={authStyles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCompleteType="password"
                />
              </View>

              <View style={authStyles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    authStyles.primaryButton, 
                    isLoading && authStyles.primaryButtonDisabled
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <Text style={[
                    authStyles.primaryButtonText,
                    isLoading && authStyles.primaryButtonTextDisabled
                  ]}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={authStyles.footerContainer}>
              <Text style={authStyles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={authStyles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;