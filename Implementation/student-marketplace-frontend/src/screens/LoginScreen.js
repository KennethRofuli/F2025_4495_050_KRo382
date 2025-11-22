import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput as PaperTextInput, Button } from 'react-native-paper';
import { authAPI } from '../services/api';
import realTimeService from '../services/realTimeService';
import { authStyles } from '../styles/AuthStyles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

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
        // Try automatic password sync before showing error
        console.log('❌ Login failed, attempting password sync...');
        try {
          const syncResult = await authAPI.attemptPasswordSync(email);
          if (syncResult.success && syncResult.synced) {
            // Retry login after successful sync
            console.log('✅ Password synced, retrying login...');
            const retryResult = await authAPI.login(email, password);
            if (retryResult.success) {
              console.log('✅ Login successful after sync');
              await realTimeService.startAfterLogin();
              
              if (retryResult.data.user.role === 'admin') {
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
              return;
            }
          }
        } catch (syncError) {
          console.log('⚠️ Sync attempt failed:', syncError);
        }
        
        Alert.alert('Error', 'Login failed invalid credentials');
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
              <PaperTextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                mode="outlined"
                style={{ marginBottom: 16, backgroundColor: '#fff' }}
                outlineColor="#ddd"
                activeOutlineColor="#3498db"
                left={<PaperTextInput.Icon icon="email" />}
              />

              <PaperTextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                autoComplete="password"
                mode="outlined"
                style={{ marginBottom: 8, backgroundColor: '#fff' }}
                outlineColor="#ddd"
                activeOutlineColor="#3498db"
                left={<PaperTextInput.Icon icon="lock" />}
                right={
                  <PaperTextInput.Icon 
                    icon={passwordVisible ? "eye-off" : "eye"} 
                    onPress={() => setPasswordVisible(!passwordVisible)}
                  />
                }
              />

              {/* Forgot Password Link */}
              <View style={[authStyles.forgotPasswordContainer, { marginTop: -8 }]}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('ForgotPassword')}
                  disabled={isLoading}
                >
                  <Text style={authStyles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <View style={authStyles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={{ borderRadius: 8, paddingVertical: 6 }}
                  contentStyle={{ paddingVertical: 8 }}
                  buttonColor="#3498db"
                >
                  Login
                </Button>
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