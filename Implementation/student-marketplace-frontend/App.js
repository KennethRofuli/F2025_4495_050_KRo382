import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MyListingsScreen from './src/screens/MyListingsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
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
            name="Dashboard" 
            component={DashboardScreen}
            options={{ 
              title: 'Marketplace',
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
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
