import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WalletProvider } from './app/contexts/WalletContext';
import { HomeScreen } from './app/screens/HomeScreen';
import { ProfileScreen } from './app/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Error boundary to catch crashes
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>App Error</Text>
          <Text style={styles.errorDetails}>{String(this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: { backgroundColor: '#1A1A1A', borderTopColor: '#2A2A2A' },
              tabBarActiveTintColor: '#14F195',
              tabBarInactiveTintColor: '#666666',
            }}
          >
            <Tab.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ tabBarLabel: 'Challenges' }}
            />
            <Tab.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ tabBarLabel: 'Profile' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </WalletProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
  errorText: { color: '#FF6B6B', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  errorDetails: { color: '#FFF', fontSize: 12 },
});
