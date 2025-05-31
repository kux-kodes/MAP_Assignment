import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  StatusBar,
  Alert,
  ImageBackground,
  Image
} from 'react-native';
import { SearchBar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { COLORS, SIZES, SHADOWS } from '../config/theme';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeamsScreen = ({ navigation }) => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Use useFocusEffect to reload teams when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Teams screen focused - refreshing data');
      fetchTeams();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  // Keep the original useEffect for initial loading
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      console.log('Fetching teams from database...');
      
      // Get all teams from local database - explicitly await the get() call
      const response = await supabase.from('teams').select('*').get();
      const { data, error } = response;
      
      console.log('Raw database response:', response);

      if (error) {
        console.error('Error in supabase fetch:', error);
        throw error;
      }
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid data format received:', data);
        setTeams([]);
        setFilteredTeams([]);
        return;
      }
      
      console.log('Teams data received, count:', data.length);
      
      // Sort teams by name
      const sortedTeams = [...data].sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      
      console.log('Sorted teams:', sortedTeams);
      setTeams(sortedTeams);
      setFilteredTeams(sortedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
      setFilteredTeams([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeams();
  };

  const handleSearch = (text) => {
    setSearch(text);
    
    if (text) {
      const filtered = teams.filter(
        team => team.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredTeams(filtered);
    } else {
      setFilteredTeams(teams);
    }
  };

  const renderTeamItem = ({ item }) => {
    // Generate a consistent color based on the team name
    const getTeamColor = (name) => {
      const colors = [COLORS.primary, COLORS.secondary, COLORS.yellowDark, COLORS.info];
      const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return colors[charSum % colors.length];
    };
    
    const teamColor = getTeamColor(item.name);

    return (
      <TouchableOpacity
        style={styles.teamCard}
        onPress={() => navigation.navigate('TeamDetails', { teamId: item.id })}
        activeOpacity={0.7}
      >
        <View style={[styles.teamInitialBadge, { backgroundColor: teamColor }]}>
          <Text style={styles.teamInitialText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={styles.teamDetailsRow}>
            <View style={styles.teamDetail}>
              <Ionicons name="person-outline" size={14} color={COLORS.primary} />
              <Text style={styles.teamDetailText}>Coach: {item.coach_name || 'Not specified'}</Text>
            </View>
            <View style={styles.teamDetail}>
              <Ionicons name="people-outline" size={14} color={COLORS.primary} />
              <Text style={styles.teamDetailText}>{item.player_count || 0} Players</Text>
            </View>
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const debugAsyncStorage = async () => {
    try {
      console.log('Checking AsyncStorage teams data directly...');
      const teamsData = await AsyncStorage.getItem('teams');
      console.log('Raw teams data from AsyncStorage:', teamsData);
      
      let parsedTeams = [];
      try {
        parsedTeams = JSON.parse(teamsData) || [];
        console.log('Parsed teams:', parsedTeams);
        
        // Show in an alert for visibility
        Alert.alert(
          'Teams in AsyncStorage', 
          `Found ${parsedTeams.length} teams: ${parsedTeams.map(t => t.name).join(', ')}`
        );
      } catch (e) {
        console.error('Error parsing teams data:', e);
        Alert.alert('Error', 'Failed to parse teams data from AsyncStorage');
      }
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
      Alert.alert('Error', 'Failed to read from AsyncStorage');
    }
  };

  const resetDatabase = async () => {
    try {
      Alert.alert(
        "Reset Database",
        "This will delete all data and create test teams. Continue?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Reset", 
            style: "destructive",
            onPress: async () => {
              try {
                console.log('Resetting database...');
                // Clear AsyncStorage
                await AsyncStorage.clear();
                
                // Create empty teams array
                await AsyncStorage.setItem('teams', JSON.stringify([]));
                
                // Add some test teams
                const testTeams = [
                  {
                    id: "team1",
                    name: "Windhoek Warriors",
                    category: "Senior Men",
                    coach_name: "John Coach",
                    coach_contact: "123456789",
                    manager_name: "Mary Manager",
                    manager_contact: "987654321",
                    home_venue: "National Stadium",
                    team_colors: "Blue/White",
                    created_at: new Date().toISOString(),
                    player_count: 0
                  },
                  {
                    id: "team2",
                    name: "Swakopmund Stars",
                    category: "Senior Women",
                    coach_name: "Sarah Smith",
                    coach_contact: "223344556",
                    manager_name: "Mike Manager",
                    manager_contact: "112233445",
                    home_venue: "Swakopmund Field",
                    team_colors: "Red/Gold",
                    created_at: new Date().toISOString(),
                    player_count: 0
                  }
                ];
                
                await AsyncStorage.setItem('teams', JSON.stringify(testTeams));
                console.log('Database reset with test teams');
                
                // Mark DB as initialized
                await AsyncStorage.setItem('db_initialized', 'true');
                
                // Refresh screen
                fetchTeams();
                
                Alert.alert("Success", "Database reset with test teams");
              } catch (error) {
                console.error('Error resetting database:', error);
                Alert.alert("Error", "Failed to reset database");
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in reset database function:', error);
    }
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
              <Text style={styles.headerTitle}>Teams</Text>
            </View>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('TeamRegistration')}
            >
              <Ionicons name="add" size={22} color={COLORS.background} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchWrapper}>
            <SearchBar
              placeholder="Search teams..."
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

      {/* Teams List */}
      <View style={styles.listWrapper}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={filteredTeams}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTeamItem}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={60} color={COLORS.primary} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>No teams found</Text>
                <Text style={styles.emptySubText}>Add a new team to get started</Text>
                
                <View style={styles.debugButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.debugButton} 
                    onPress={debugAsyncStorage}
                  >
                    <Text style={styles.debugButtonText}>Check Storage</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.debugButton, styles.resetButton]} 
                    onPress={resetDatabase}
                  >
                    <Text style={styles.debugButtonText}>Reset Database</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        )}
      </View>
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TeamRegistration')}
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
  listWrapper: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
  },
  listContainer: {
    padding: SIZES.medium,
    paddingBottom: 80, // Extra padding for FAB
  },
  teamCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: SIZES.medium,
    padding: SIZES.medium,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  teamInitialBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  teamInitialText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: COLORS.yellowLight,
    paddingVertical: 2,
    paddingHorizontal: SIZES.small,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: SIZES.small,
  },
  categoryText: {
    fontSize: SIZES.small,
    fontWeight: '500',
    color: COLORS.yellowDark,
  },
  teamDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  teamDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.medium,
    marginVertical: 2,
  },
  teamDetailText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: SIZES.small,
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
    marginBottom: SIZES.medium,
  },
  debugButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.medium,
    marginTop: SIZES.large,
  },
  debugButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.base,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#D32F2F', // Red color for reset button
  },
  debugButtonText: {
    color: COLORS.background,
    fontWeight: '500',
    fontSize: SIZES.font,
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

export default TeamsScreen;
