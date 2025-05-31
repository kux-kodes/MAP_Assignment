import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/config/theme';
import 'react-native-url-polyfill/auto';
import { supabase } from './src/config/supabase';

// Ignore specific warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core',
  'Possible Unhandled Promise Rejection',
  'Setting a timer for a long period of time',
]);

export default function App() {
  useEffect(() => {
    // Initialize the database explicitly
    const initializeDatabase = async () => {
      try {
        console.log('Initializing database...');
        await supabase.initialize();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    
    initializeDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
