import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  ImageBackground,
  Image,
  StatusBar 
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { COLORS, SIZES, SHADOWS } from '../config/theme';

const EventsScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Get all events from local database
      const { data, error } = await supabase.from('events').select('*').get();

      if (error) throw error;
      
      // Sort events by date (ascending)
      const sortedEvents = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.event_date || 0);
        const dateB = new Date(b.event_date || 0);
        return dateA - dateB;
      });
      
      console.log('Fetched events:', sortedEvents);
      setEvents(sortedEvents || []);
      setFilteredEvents(sortedEvents || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleSearch = (text) => {
    setSearch(text);
    filterEvents(text, activeFilter);
  };
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    filterEvents(search, filter);
  };
  
  const filterEvents = (searchText, filter) => {
    let filtered = [...events];
    
    // Apply category filter
    if (filter === 'upcoming') {
      filtered = filtered.filter(event => isUpcoming(event.event_date));
    } else if (filter === 'past') {
      filtered = filtered.filter(event => !isUpcoming(event.event_date));
    }
    
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(event => {
        return (
          event.name.toLowerCase().includes(searchLower) ||
          event.location.toLowerCase().includes(searchLower) ||
          (event.description && event.description.toLowerCase().includes(searchLower))
        );
      });
    }
    
    setFilteredEvents(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    return eventDate >= today;
  };

  const renderEventItem = ({ item }) => {
    const upcoming = isUpcoming(item.event_date);
    const eventDate = new Date(item.event_date);
    
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.eventDateContainer}>
          <View style={[
            styles.dateBox,
            upcoming ? styles.upcomingDateBox : styles.pastDateBox
          ]}>
            <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
            <Text style={styles.dateMonth}>{eventDate.toLocaleString('default', { month: 'short' })}</Text>
          </View>
          <Text style={styles.dateTime}>{formatTime(item.event_date)}</Text>
        </View>
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventName} numberOfLines={1}>{item.name}</Text>
            {upcoming && (
              <View style={styles.upcomingBadge}>
                <Text style={styles.upcomingBadgeText}>Upcoming</Text>
              </View>
            )}
          </View>
          
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.primary} />
              <Text style={styles.detailText} numberOfLines={1}>{item.location || 'Location not specified'}</Text>
            </View>
            
            {item.event_type && (
              <View style={styles.detailRow}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.detailText} numberOfLines={1}>{item.event_type}</Text>
              </View>
            )}
          </View>
          
          {item.description && (
            <Text 
              style={styles.description}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}
        </View>
        
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {/* Modern Header with Background */}
      <View style={styles.header}>
        <ImageBackground 
          source={require('../../assets/adaptive-icon.png')} 
          style={styles.headerBg}
          imageStyle={{ opacity: 0.05 }}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerTitleContainer}>
              <Image 
                source={require('../../assets/adaptive-icon.png')} 
                style={styles.headerIcon}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>Events</Text>
            </View>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('EventRegistration')}
            >
              <Ionicons name="add" size={22} color={COLORS.background} />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchWrapper}>
            <SearchBar
              placeholder="Search events..."
              onChangeText={handleSearch}
              value={search}
              containerStyle={styles.searchContainer}
              inputContainerStyle={styles.searchInputContainer}
              inputStyle={styles.searchInput}
              searchIcon={{ size: 20, color: COLORS.primary }}
              clearIcon={{ size: 20, color: COLORS.primary }}
              lightTheme
              round
              showLoading={loading && !refreshing}
            />
          </View>
        </ImageBackground>
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterTab,
            activeFilter === 'all' && styles.activeFilterTab
          ]}
          onPress={() => handleFilterChange('all')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'all' && styles.activeFilterText
          ]}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterTab,
            activeFilter === 'upcoming' && styles.activeFilterTab
          ]}
          onPress={() => handleFilterChange('upcoming')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'upcoming' && styles.activeFilterText
          ]}>Upcoming</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.filterTab,
            activeFilter === 'past' && styles.activeFilterTab
          ]}
          onPress={() => handleFilterChange('past')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'past' && styles.activeFilterText
          ]}>Past</Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <View style={styles.listWrapper}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderEventItem}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={60} color={COLORS.primary} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>
                  {activeFilter === 'all' ? 'No events found' :
                   activeFilter === 'upcoming' ? 'No upcoming events' : 'No past events'}
                </Text>
                <Text style={styles.emptySubText}>
                  {search ? 'Try a different search term' : 'Add a new event to get started'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EventRegistration')}
      >
        <Ionicons name="add" size={24} color={COLORS.background} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  header: {
    backgroundColor: COLORS.primary,
  },
  headerBg: {
    paddingTop: SIZES.medium,
    paddingBottom: SIZES.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.small,
    paddingHorizontal: SIZES.medium,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 30,
    height: 30,
    marginRight: SIZES.small,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  searchWrapper: {
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.small,
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchInputContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    height: 46,
  },
  searchInput: {
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: SIZES.small,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SIZES.small,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterTab: {
    borderBottomColor: COLORS.accent,
  },
  filterText: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  activeFilterText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listWrapper: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  listContainer: {
    padding: SIZES.medium,
    paddingBottom: 80, // Extra padding for FAB
  },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: SIZES.medium,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  eventDateContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.small,
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.small / 2,
  },
  upcomingDateBox: {
    backgroundColor: COLORS.accent,
  },
  pastDateBox: {
    backgroundColor: COLORS.surfaceDark,
  },
  dateDay: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateMonth: {
    fontSize: SIZES.small,
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  dateTime: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  eventContent: {
    flex: 1,
    padding: SIZES.medium,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.small / 2,
  },
  eventName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SIZES.small,
  },
  upcomingBadge: {
    backgroundColor: COLORS.yellowLight,
    paddingVertical: 2,
    paddingHorizontal: SIZES.small,
    borderRadius: 12,
  },
  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.yellowDark,
  },
  eventDetails: {
    marginBottom: SIZES.small,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: SIZES.small,
    color: COLORS.text,
    lineHeight: 18,
  },
  arrowContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SIZES.extraLarge,
    alignItems: 'center',
    marginTop: SIZES.large,
    ...SHADOWS.small,
  },
  emptyIcon: {
    marginBottom: SIZES.small,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SIZES.small / 2,
  },
  emptySubText: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: SIZES.medium,
    bottom: SIZES.medium,
    backgroundColor: COLORS.accent,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
});

export default EventsScreen;
