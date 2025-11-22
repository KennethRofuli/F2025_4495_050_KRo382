import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { paperTheme } from './src/styles/CommonStyles';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import PasswordResetScreen from './src/screens/PasswordResetScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import MyListingsScreen from './src/screens/MyListingsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import MarketIntelligenceScreen from './src/screens/MarketIntelligenceScreen';

const Stack = createStackNavigator();

// Custom theme to match our app's color scheme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...paperTheme.colors,
  },
  roundness: paperTheme.roundness,
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3498db',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              title: 'Student Marketplace',
              headerShown: false 
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              title: 'Create Account',
              headerShown: false 
            }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{ 
              title: 'Reset Password',
              headerShown: false 
            }}
          />
          <Stack.Screen 
            name="PasswordReset" 
            component={PasswordResetScreen}
            options={{ 
              title: 'Create New Password',
              headerShown: false 
            }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ 
              title: 'Marketplace',
              headerShown: false,
              gestureEnabled: false
            }}
          />
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboardScreen}
            options={{ 
              title: 'Admin Dashboard',
              headerShown: false,
              gestureEnabled: false
            }}
          />
          <Stack.Screen 
            name="MyListings" 
            component={MyListingsScreen}
            options={{ 
              title: 'My Listings',
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="Favorites" 
            component={FavoritesScreen}
            options={{ 
              title: 'Favorites',
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ 
              title: 'Profile',
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="Messages" 
            component={MessagesScreen}
            options={{ 
              title: 'Messages',
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen}
            options={{ 
              title: 'User Profile',
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="MarketIntelligence" 
            component={MarketIntelligenceScreen}
            options={{ 
              title: 'Market Intelligence',
              headerShown: false
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
