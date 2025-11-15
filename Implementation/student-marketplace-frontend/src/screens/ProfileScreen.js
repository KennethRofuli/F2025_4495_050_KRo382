import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserRatingDisplay } from '../components/RatingDisplay';
import { ratingAPI, authAPI, tokenManager } from '../services/api';
import realTimeService from '../services/realTimeService';

const ProfileScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    campus: '',
    avatar: null,
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [userStats, setUserStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
    loadUserRatings();
  }, []);

  const loadUserData = async () => {
    try {
      // Get user info from backend API
      const result = await authAPI.getProfile();
      if (result.success) {
        const user = result.data.user;
        setUserInfo({
          name: user.name || '',
          email: user.email || '',
          campus: user.campus || '',
          avatar: user.avatar || null,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserRatings = async () => {
    try {
      // Get current user ID from token
      const userId = await authAPI.getCurrentUserId();
      if (userId) {
        const statsResponse = await ratingAPI.getUserRatingStats(userId);
        if (statsResponse.success) {
          setUserStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error loading user ratings:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userInfo.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.updateProfile({
        name: userInfo.name,
        campus: userInfo.campus,
        avatar: userInfo.avatar,
      });
      
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
        // Reload user data to get fresh info
        loadUserData();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      
      if (result.success) {
        Alert.alert('Success', 'Password changed successfully!');
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsChangingPassword(false);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Stop real-time service
              realTimeService.stopAfterLogout();
              
              // Remove token
              await tokenManager.removeToken();
              
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons 
              name={isEditing ? "checkmark" : "pencil"} 
              size={24} 
              color="#007AFF" 
            />
          </TouchableOpacity>
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {userInfo.avatar ? (
              <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={50} color="#666" />
              </View>
            )}
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={userInfo.name}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, name: text }))}
              editable={isEditing}
              placeholder="Enter your name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={userInfo.email}
              editable={false}
              placeholder="your.email@example.com"
            />
            <Text style={styles.inputNote}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Campus</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={userInfo.campus}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, campus: text }))}
              editable={isEditing}
              placeholder="Your campus"
            />
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rating Section */}
        {userStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Ratings</Text>
            <UserRatingDisplay
              averageRating={userStats.averageRating}
              totalRatings={userStats.totalRatings}
              sellerRating={userStats.sellerRating}
              buyerRating={userStats.buyerRating}
              sellerTransactions={userStats.sellerTransactions}
              buyerTransactions={userStats.buyerTransactions}
              showDetailed={true}
            />
          </View>
        )}

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <TouchableOpacity
            style={styles.securityOption}
            onPress={() => setIsChangingPassword(!isChangingPassword)}
          >
            <Text style={styles.securityOptionText}>Change Password</Text>
            <Ionicons 
              name={isChangingPassword ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>

          {isChangingPassword && (
            <View style={styles.passwordSection}>
              <TextInput
                style={styles.input}
                value={passwords.currentPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, currentPassword: text }))}
                placeholder="Current Password"
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                value={passwords.newPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, newPassword: text }))}
                placeholder="New Password"
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                value={passwords.confirmPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm New Password"
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text style={styles.changePasswordButtonText}>
                  {loading ? 'Changing...' : 'Change Password'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    padding: 5,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  changeAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  inputNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  securityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  securityOptionText: {
    fontSize: 16,
    color: '#333',
  },
  passwordSection: {
    paddingTop: 20,
  },
  changePasswordButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  changePasswordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;