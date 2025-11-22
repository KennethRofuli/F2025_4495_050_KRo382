import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { TextInput as PaperTextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { UserRatingDisplay } from '../components/RatingDisplay';
import { ratingAPI, authAPI, tokenManager } from '../services/api';
import realTimeService from '../services/realTimeService';
import { colors, spacing, typography, borderRadius, commonStyles } from '../styles/CommonStyles';

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
            <PaperTextInput
              label="Name"
              value={userInfo.name}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, name: text }))}
              editable={isEditing}
              mode="outlined"
              style={{ backgroundColor: isEditing ? '#fff' : '#f8f9fa' }}
              outlineColor="#ddd"
              activeOutlineColor="#3498db"
              disabled={!isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <PaperTextInput
              label="Email"
              value={userInfo.email}
              editable={false}
              mode="outlined"
              style={{ backgroundColor: '#f8f9fa' }}
              outlineColor="#ddd"
              activeOutlineColor="#3498db"
              disabled={true}
            />
            <Text style={styles.inputNote}>Email cannot be changed</Text>
          </View>

          <View style={styles.inputGroup}>
            <PaperTextInput
              label="Campus"
              value={userInfo.campus}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, campus: text }))}
              editable={isEditing}
              mode="outlined"
              style={{ backgroundColor: isEditing ? '#fff' : '#f8f9fa' }}
              outlineColor="#ddd"
              activeOutlineColor="#3498db"
              disabled={!isEditing}
            />
          </View>

          {isEditing && (
            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              loading={loading}
              disabled={loading}
              style={{ borderRadius: 8, marginTop: 10 }}
              contentStyle={{ paddingVertical: 8 }}
              buttonColor="#3498db"
            >
              Save Changes
            </Button>
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
              <PaperTextInput
                label="Current Password"
                value={passwords.currentPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, currentPassword: text }))}
                secureTextEntry
                mode="outlined"
                style={{ backgroundColor: '#fff', marginBottom: 16 }}
                outlineColor="#ddd"
                activeOutlineColor="#3498db"
              />
              <PaperTextInput
                label="New Password"
                value={passwords.newPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, newPassword: text }))}
                secureTextEntry
                mode="outlined"
                style={{ backgroundColor: '#fff', marginBottom: 16 }}
                outlineColor="#ddd"
                activeOutlineColor="#3498db"
              />
              <PaperTextInput
                label="Confirm New Password"
                value={passwords.confirmPassword}
                onChangeText={(text) => setPasswords(prev => ({ ...prev, confirmPassword: text }))}
                secureTextEntry
                mode="outlined"
                style={{ backgroundColor: '#fff', marginBottom: 16 }}
                outlineColor="#ddd"
                activeOutlineColor="#3498db"
              />
              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={loading}
                disabled={loading}
                style={{ borderRadius: 8 }}
                contentStyle={{ paddingVertical: 8 }}
                buttonColor="#FF6B35"
              >
                Change Password
              </Button>
            </View>
          )}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={{ borderRadius: 8 }}
            contentStyle={{ paddingVertical: 8 }}
            buttonColor="#dc3545"
          >
            Logout
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
  },
  scrollView: {
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
  editButton: {
    padding: spacing.xs,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.round * 2,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.round * 2,
    backgroundColor: colors.placeholder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xxl,
  },
  changeAvatarText: {
    color: colors.white,
    fontSize: typography.sm,
    fontWeight: typography.medium,
  },
  section: {
    ...commonStyles.section,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...commonStyles.label,
  },
  input: {
    ...commonStyles.input,
  },
  inputDisabled: {
    backgroundColor: colors.background,
    color: colors.textSecondary,
  },
  inputNote: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  securityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLighter,
  },
  securityOptionText: {
    fontSize: typography.md,
    color: colors.textPrimary,
  },
  passwordSection: {
    paddingTop: spacing.xl,
  },
});

export default ProfileScreen;