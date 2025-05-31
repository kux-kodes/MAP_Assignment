import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../config/supabase';
import { COLORS, SIZES, SHADOWS } from '../config/theme';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 200;

const HomeScreen = ({ navigation }) => {
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchRecentData();
  }, []);

  const fetchRecentData = async () => {
    try {
      setLoading(true);
      // Fetch recent events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(4);

      if (eventsError) throw eventsError;

      setRecentEvents(events || []);
    } catch (error) {
      console.error('Error fetching recent data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecentData();
  };

  // Header animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.7, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -5],
    extrapolate: 'clamp',
  });

  const heroScale = scrollY.interpolate({
    inputRange: [-50, 0],
    outputRange: [1.1, 1],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 30, 60],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const QuickAction = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={styles.quickActionIconContainer}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.quickActionText}>{label}</Text>
    </TouchableOpacity>
  );

  const EventCard = ({ event }) => {
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    const isUpcoming = new Date() < eventDate;

    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventsTab', { 
          screen: 'EventDetails', 
          params: { eventId: event.id } 
        })}
      >
        <View style={[styles.eventStatusIndicator, 
          { backgroundColor: isUpcoming ? COLORS.primary : COLORS.textLight }]} />

        <View style={styles.eventContent}>
          <Text style={styles.eventDate}>{formattedDate}</Text>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.name}</Text>
          
          <View style={styles.eventDetails}>
            <View style={styles.eventLocation}>
              <Ionicons name="location-sharp" size={14} color={COLORS.primary} />
              <Text style={styles.eventLocationText} numberOfLines={1}>{event.location}</Text>
            </View>
            
            <View style={styles.eventStatus}>
              <View style={[styles.eventStatusDot, 
                { backgroundColor: isUpcoming ? COLORS.primary : COLORS.textLight }]} />
              <Text style={styles.eventStatusText}>
                {isUpcoming ? 'Upcoming' : 'Past'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Animated Header Background */}
      <Animated.View 
        style={[
          styles.animatedHeader, 
          { 
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }] 
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLogoContainer}>
            <Image 
              source={require('../../assets/adaptive-icon.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Namibia Hockey</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Content */}
      <Animated.ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: Platform.OS === 'ios' ? 110 : 90 }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[COLORS.primary]} 
            progressBackgroundColor={COLORS.surface}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            { 
              opacity: heroOpacity,
              transform: [{ scale: heroScale }]
            }
          ]}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroLogoContainer}>
              <Image 
                source={require('../../assets/adaptive-icon.png')} 
                style={styles.heroLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>Hockey Union</Text>
              <Text style={styles.heroSubtitle}>Manage teams, players & events</Text>
            </View>
          </View>
        </Animated.View>

        {/* Cards Section */}
        <View style={styles.cardsSection}>
          {/* Quick Actions Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <Ionicons name="flash" size={20} color={COLORS.primary} />
            </View>
            
            <View style={styles.quickActionsGrid}>
              <QuickAction 
                icon="people" 
                label="Teams" 
                onPress={() => navigation.navigate('TeamsTab')}
              />
              <QuickAction 
                icon="person" 
                label="Players" 
                onPress={() => navigation.navigate('PlayersTab')}
              />
              <QuickAction 
                icon="calendar" 
                label="Events" 
                onPress={() => navigation.navigate('EventsTab')}
              />
              <QuickAction 
                icon="add-circle" 
                label="Create" 
                onPress={() => {
                  // Show registration options in a modal or navigate to a registration hub
                  navigation.navigate('TeamsTab', { screen: 'TeamRegistration' });
                }}
              />
            </View>
          </View>
          
          {/* Events Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => navigation.navigate('EventsTab')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : recentEvents.length > 0 ? (
              <View style={styles.eventsContainer}>
                {recentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>No upcoming events</Text>
              </View>
            )}
          </View>
          
          {/* Create New Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Create New</Text>
              <Ionicons name="add-circle" size={20} color={COLORS.primary} />
            </View>
            
            <View style={styles.registrationButtonsContainer}>
              <TouchableOpacity 
                style={styles.registrationButton}
                onPress={() => navigation.navigate('TeamsTab', { screen: 'TeamRegistration' })}
              >
                <Ionicons name="people" size={24} color={COLORS.text} />
                <View style={styles.registrationButtonContent}>
                  <Text style={styles.registrationButtonTitle}>New Team</Text>
                  <Text style={styles.registrationButtonDescription}>Create a team profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.registrationButton}
                onPress={() => navigation.navigate('PlayersTab', { screen: 'PlayerRegistration' })}
              >
                <Ionicons name="person" size={24} color={COLORS.text} />
                <View style={styles.registrationButtonContent}>
                  <Text style={styles.registrationButtonTitle}>New Player</Text>
                  <Text style={styles.registrationButtonDescription}>Register a player</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.registrationButton}
                onPress={() => navigation.navigate('EventsTab', { screen: 'EventRegistration' })}
              >
                <Ionicons name="calendar" size={24} color={COLORS.text} />
                <View style={styles.registrationButtonContent}>
                  <Text style={styles.registrationButtonTitle}>New Event</Text>
                  <Text style={styles.registrationButtonDescription}>Schedule an event</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: COLORS.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '40',
    height: Platform.OS === 'ios' ? 100 : 80,
    justifyContent: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerLogoContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    marginBottom: 0,
  },
  headerLogo: {
    width: '100%',
    height: '100%',
  },
  headerTextContainer: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  heroSection: {
    height: 120,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 0,
    marginTop: 0,
    marginHorizontal: 0,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  heroContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    paddingTop: 30,
  },
  heroLogoContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    marginBottom: 0,
  },
  heroLogo: {
    width: '100%',
    height: '100%',
  },
  heroTextContainer: {
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: SIZES.font,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
  },
  cardsSection: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    ...SHADOWS.glow,
  },
  quickActionText: {
    fontSize: SIZES.small,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 5,
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    overflow: 'hidden',
    borderLeftWidth: 0,
    ...SHADOWS.small,
  },
  eventStatusIndicator: {
    width: 4,
    backgroundColor: COLORS.primary,
  },
  eventContent: {
    flex: 1,
    padding: 14,
  },
  eventDate: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventLocationText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  eventStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 4,
  },
  eventStatusText: {
    fontSize: SIZES.small - 1,
    color: COLORS.textLight,
  },
  loadingContainer: {
    padding: SIZES.medium,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textLight,
  },
  emptyContainer: {
    padding: SIZES.large,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginTop: SIZES.base,
    fontStyle: 'italic',
  },
  registrationButtonsContainer: {
    gap: 12,
  },
  registrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  registrationButtonContent: {
    flex: 1,
    marginLeft: 12,
  },
  registrationButtonTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  registrationButtonDescription: {
    fontSize: SIZES.small - 1,
    color: COLORS.textLight,
  },
});

export default HomeScreen;
