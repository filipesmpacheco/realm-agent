import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import RealmsScreen from './src/screens/RealmsScreen';
import HomeScreen from './src/screens/HomeScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

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
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
