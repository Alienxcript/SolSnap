import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import 'text-encoding';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Compass, PlusSquare, User } from 'lucide-react-native';
import { WalletProvider } from './app/contexts/WalletContext';
import { HomeScreen } from './app/screens/HomeScreen';
import { ExploreScreen } from './app/screens/ExploreScreen';
import { CreateChallengeScreen } from './app/screens/CreateChallengeScreen';
import { ProfileScreen } from './app/screens/ProfileScreen';
import { ChallengeDetailScreen } from './app/screens/ChallengeDetailScreen';
import { CameraScreen } from './app/screens/CameraScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

// Home Stack Navigator (includes HomeScreen and ChallengeDetail)
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
    </Stack.Navigator>
  );
}

// Explore Stack
function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
    </Stack.Navigator>
  );
}

// Profile Stack
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: { 
                backgroundColor: '#0A0A0A', 
                borderTopColor: '#1F1F1F',
                borderTopWidth: 1,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
              },
              tabBarActiveTintColor: '#FFFFFF',
              tabBarInactiveTintColor: '#444444',
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
                marginTop: 4,
              },
              tabBarIcon: ({ focused, color, size }) => {
                let IconComponent;
                
                if (route.name === 'Home') {
                  IconComponent = Home;
                } else if (route.name === 'Explore') {
                  IconComponent = Compass;
                } else if (route.name === 'Create') {
                  IconComponent = PlusSquare;
                } else if (route.name === 'Profile') {
                  IconComponent = User;
                }
                
                return (
                  <View style={styles.iconContainer}>
                    {focused && <View style={styles.activeDot} />}
                    <IconComponent size={size} color={color} />
                  </View>
                );
              },
            })}
          >
            <Tab.Screen 
              name="Home" 
              component={HomeStack}
              options={{ 
                tabBarLabel: 'Home',
              }}
            />
            <Tab.Screen 
              name="Explore" 
              component={ExploreStack}
              options={{ 
                tabBarLabel: 'Explore',
              }}
            />
            <Tab.Screen 
              name="Create" 
              component={CreateChallengeScreen}
              options={{ 
                tabBarLabel: 'Create',
              }}
            />
            <Tab.Screen 
              name="Profile" 
              component={ProfileStack}
              options={{ 
                tabBarLabel: 'Profile',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </WalletProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#000', 
    padding: 20 
  },
  errorText: { 
    color: '#FF6B6B', 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  errorDetails: { 
    color: '#FFF', 
    fontSize: 12 
  },
  iconContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9945FF',
    position: 'absolute',
    top: -8,
  },
});
