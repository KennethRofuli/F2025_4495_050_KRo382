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
import { authStyles } from '../styles/AuthStyles';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [campus, setCampus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

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
              <PaperTextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                mode="outlined"
                style={{ marginBottom: 16, backgroundColor: '#fff' }}
                outlineColor="#ddd"
                activeOutlineColor="#3498db"
                left={<PaperTextInput.Icon icon="account" />}
              />

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
                label="Campus"
                value={campus}
                onChangeText={setCampus}
                mode="outlined"
                style={{ marginBottom: 16, backgroundColor: '#fff' }}
                outlineColor="#ddd"
                activeOutlineColor="#3498db"
                left={<PaperTextInput.Icon icon="school" />}
                placeholder="Enter your campus"
              />

              <PaperTextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                autoComplete="password-new"
                mode="outlined"
                style={{ marginBottom: 16, backgroundColor: '#fff' }}
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

              <PaperTextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!confirmPasswordVisible}
                autoComplete="password-new"
                mode="outlined"
                style={{ marginBottom: 16, backgroundColor: '#fff' }}
                outlineColor="#ddd"
                activeOutlineColor="#3498db"
                left={<PaperTextInput.Icon icon="lock-check" />}
                right={
                  <PaperTextInput.Icon 
                    icon={confirmPasswordVisible ? "eye-off" : "eye"} 
                    onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  />
                }
              />

              <View style={authStyles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
                  style={{ borderRadius: 8, paddingVertical: 6 }}
                  contentStyle={{ paddingVertical: 8 }}
                  buttonColor="#3498db"
                >
                  Create Account
                </Button>
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