import { ActivityIndicator, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState } from 'react';

import RealmsScreen from './src/screens/RealmsScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { useAuth } from './src/hooks/useAuth';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const authState = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (authState.status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (authState.status === 'unauthenticated') {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" translucent />
        {showRegister ? (
          <RegisterScreen onGoToLogin={() => setShowRegister(false)} />
        ) : (
          <LoginScreen onGoToRegister={() => setShowRegister(true)} />
        )}
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.divider,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.onSurfaceVariant,
          }}
        >
          <Tab.Screen
            name="Realms"
            component={RealmsScreen}
            options={{ tabBarLabel: 'Realms' }}
          />
          <Tab.Screen
            name="Notifications"
            component={HomeScreen}
            options={{ tabBarLabel: 'Notifications' }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ tabBarLabel: 'Profile' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
