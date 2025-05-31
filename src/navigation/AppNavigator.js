import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import TeamsScreen from '../screens/TeamsScreen';
import PlayersScreen from '../screens/PlayersScreen';
import EventsScreen from '../screens/EventsScreen';
import HelpScreen from '../screens/HelpScreen';
import TeamRegistrationScreen from '../screens/TeamRegistrationScreen';
import PlayerRegistrationScreen from '../screens/PlayerRegistrationScreen';
import EventRegistrationScreen from '../screens/EventRegistrationScreen';
import TeamDetailsScreen from '../screens/TeamDetailsScreen';
import PlayerDetailsScreen from '../screens/PlayerDetailsScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';

import { COLORS, SIZES, SHADOWS } from '../config/theme';

const { width, height } = Dimensions.get('window');
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack navigator options
const stackScreenOptions = {
  headerStyle: { 
    backgroundColor: COLORS.surface,
  },
  headerTintColor: COLORS.text,
  headerTitleStyle: {
    fontWeight: '600',
    color: COLORS.text,
  },
  headerShadowVisible: false,
  animation: 'slide_from_right',
  statusBarColor: COLORS.background,
  statusBarStyle: 'light',
  headerBackTitleVisible: false,
  contentStyle: {
    backgroundColor: COLORS.background,
  }
};

const TeamStack = () => (
  <Stack.Navigator
    screenOptions={stackScreenOptions}
  >
    <Stack.Screen name="Teams" component={TeamsScreen} />
    <Stack.Screen name="TeamRegistration" component={TeamRegistrationScreen} options={{ title: 'Register Team' }} />
    <Stack.Screen name="TeamDetails" component={TeamDetailsScreen} options={{ title: 'Team Details' }} />
  </Stack.Navigator>
);

const PlayerStack = () => (
  <Stack.Navigator
    screenOptions={stackScreenOptions}
  >
    <Stack.Screen name="Players" component={PlayersScreen} />
    <Stack.Screen name="PlayerRegistration" component={PlayerRegistrationScreen} options={{ title: 'Register Player' }} />
    <Stack.Screen name="PlayerDetails" component={PlayerDetailsScreen} options={{ title: 'Player Details' }} />
  </Stack.Navigator>
);

const EventStack = () => (
  <Stack.Navigator
    screenOptions={stackScreenOptions}
  >
    <Stack.Screen name="Events" component={EventsScreen} />
    <Stack.Screen name="EventRegistration" component={EventRegistrationScreen} options={{ title: 'Register Event' }} />
    <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
  </Stack.Navigator>
);

// Custom tab bar component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);
  
  return (
    <View style={[
      styles.tabBarContainer, 
      { paddingBottom: bottomPadding, height: 70 + bottomPadding }
    ]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name.replace('Tab', '');

          const isFocused = state.index === index;

          let iconName;
          if (route.name === 'HomeTab') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'TeamsTab') {
            iconName = isFocused ? 'people' : 'people-outline';
          } else if (route.name === 'PlayersTab') {
            iconName = isFocused ? 'person' : 'person-outline';
          } else if (route.name === 'EventsTab') {
            iconName = isFocused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'HelpTab') {
            iconName = isFocused ? 'help-circle' : 'help-circle-outline';
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              {index === 2 ? (
                // Center button (larger and elevated)
                <View style={styles.centerTabButton}>
                  <Ionicons name={iconName} size={26} color={COLORS.background} />
                </View>
              ) : (
                // Regular tab buttons
                <View style={styles.tabItemContent}>
                  <View style={[styles.iconContainer, isFocused && styles.selectedIconContainer]}>
                    <Ionicons name={iconName} size={22} color={isFocused ? COLORS.primary : COLORS.textLight} />
                  </View>
                  {isFocused && (
                    <Text style={styles.tabLabel}>{label}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const AppTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      lazy: false,
      tabBarHideOnKeyboard: true,
    }}
  >
    <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
    <Tab.Screen name="TeamsTab" component={TeamStack} options={{ title: 'Teams' }} />
    <Tab.Screen name="EventsTab" component={EventStack} options={{ title: 'Events' }} />
    <Tab.Screen name="PlayersTab" component={PlayerStack} options={{ title: 'Players' }} />
    <Tab.Screen name="HelpTab" component={HelpScreen} options={{ title: 'Help' }} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    marginHorizontal: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: width - 40,
    maxWidth: 500,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  selectedIconContainer: {
    backgroundColor: COLORS.surfaceDark,
    ...SHADOWS.glow,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  centerTabButton: {
    width: 54,
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    ...SHADOWS.glow,
    borderWidth: 3,
    borderColor: COLORS.surface,
  }
});

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <AppTabs />
    </NavigationContainer>
  );
};

export default AppNavigator;
