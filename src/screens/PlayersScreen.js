import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  ImageBackground,
  Image,
  StatusBar
} from 'react-native';
import { Card, SearchBar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { COLORS, SIZES, SHADOWS } from '../config/theme';

const PlayersScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Categories for filtering
  const categories = [
    'All',
    'Senior Men', 
    'Senior Women', 
    'Junior Men', 
    'Junior Women', 
    'Boys U18', 
    'Girls U18', 
    'Boys U16', 
    'Girls U16', 
    'Boys U14', 
    'Girls U14'
  ];

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      // Get all players from local database
      const { data: playersData, error: playersError } = await supabase.from('players').select('*').get();
      if (playersError) throw playersError;
      
      // Get all teams from local database
      const { data: teamsData, error: teamsError } = await supabase.from('teams').select('*').get();
      if (teamsError) throw teamsError;
      
      // Map teams to players
      const playersWithTeams = playersData.map(player => {
        const team = teamsData.find(team => team.id === player.team_id);
        return {
          ...player,
          teams: team || null
        };
      });
      
      // Sort players by last name
      const sortedPlayers = [...playersWithTeams].sort((a, b) => {
        return a.last_name.localeCompare(b.last_name);
      });
      
      console.log('Fetched players:', sortedPlayers);
      setPlayers(sortedPlayers || []);
      setFilteredPlayers(sortedPlayers || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPlayers();
  };

  const filterPlayers = (searchText = search, category = selectedCategory) => {
    let filtered = players;
    
    // Apply category filter
    if (category !== 'All') {
      filtered = filtered.filter(player => player.teams?.category === category);
    }
    
    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(player => {
        const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
        return fullName.includes(searchText.toLowerCase()) || 
               (player.teams?.name && player.teams.name.toLowerCase().includes(searchText.toLowerCase()));
      });
    }
    
    setFilteredPlayers(filtered);
  };
  
  const handleSearch = (text) => {
    setSearch(text);
    filterPlayers(text, selectedCategory);
  };
  
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterPlayers(search, category);
  };

  const renderPlayerItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PlayerDetails', { playerId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.playerCard}>
        <View style={[styles.profileImage, { backgroundColor: getProfileColor(item) }]}>
          <Text style={styles.profileInitials}>
            {item.first_name.charAt(0)}{item.last_name.charAt(0)}
          </Text>
        </View>
        
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.first_name} {item.last_name}</Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.playerDetailItem}>
              <Ionicons name="football-outline" size={14} color={COLORS.primary} />
              <Text style={styles.playerDetails}>
                {item.position || 'No position'}
              </Text>
            </View>
            
            {item.jersey_number && (
            <View style={styles.playerDetailItem}>
              <Ionicons name="shirt-outline" size={14} color={COLORS.primary} />
              <Text style={styles.playerDetails}>
                #{item.jersey_number}
              </Text>
            </View>
            )}
          </View>
          
          <View style={styles.teamRow}>
            <Ionicons name="people-outline" size={14} color={COLORS.primary} />
            <Text style={styles.teamName}>
              {item.teams ? item.teams.name : 'No team assigned'}
            </Text>
          </View>
          
          {item.teams && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.teams.category}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Generate a consistent color based on player name
  const getProfileColor = (player) => {
    const colors = [
      COLORS.primary,
      COLORS.secondary,
      COLORS.yellowDark,
      COLORS.info
    ];
    const nameHash = (player.first_name + player.last_name).split('').reduce(
      (acc, char) => acc + char.charCodeAt(0), 0
    );
    return colors[nameHash % colors.length];
  };
  
  // Get color based on category
  const getCategoryColor = (category) => {
    if (category === 'All') return COLORS.primary;
    
    // Use our new color scheme instead of the old one
    const isMale = category.includes('Men') || category.includes('Boys');
    const isSenior = category.includes('Senior');
    
    if (isMale) {
      return isSenior ? COLORS.primary : COLORS.secondary;
    } else {
      return isSenior ? COLORS.yellowDark : COLORS.info;
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
              <Text style={styles.headerTitle}>Players</Text>
            </View>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('PlayerRegistration')}
            >
              <Ionicons name="add" size={22} color={COLORS.background} />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchWrapper}>
            <SearchBar
              placeholder="Search players..."
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
      
      {/* Categories Filter */}
      <View style={styles.categoryFiltersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilters}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryFilterButton,
                selectedCategory === category && styles.selectedCategoryButton,
                {backgroundColor: selectedCategory === category 
                  ? getCategoryColor(category) 
                  : category === 'All' ? COLORS.surface : COLORS.surfaceLight}
              ]}
              onPress={() => handleCategoryFilter(category)}
            >
              <Text 
                style={[
                  styles.categoryFilterText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Players List */}
      <View style={styles.listWrapper}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={filteredPlayers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPlayerItem}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="person-outline" size={60} color={COLORS.primary} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>No players found</Text>
                <Text style={styles.emptySubText}>
                  {search ? 'Try a different search term' : 
                   selectedCategory !== 'All' ? 'Try a different category' : 
                   'Add a new player to get started'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PlayerRegistration')}
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
  categoryFiltersContainer: {
    marginTop: -5,
    marginBottom: SIZES.small,
    backgroundColor: COLORS.surfaceLight,
  },
  categoryFilters: {
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.medium,
    paddingBottom: SIZES.small,
  },
  categoryFilterButton: {
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: 50,
    marginRight: SIZES.small,
    ...SHADOWS.small,
  },
  selectedCategoryButton: {
    ...SHADOWS.medium,
  },
  categoryFilterText: {
    fontSize: SIZES.font,
    fontWeight: '500',
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: COLORS.surface,
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
  playerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: SIZES.medium,
    padding: SIZES.medium,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  profileInitials: {
    color: COLORS.background,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    paddingLeft: SIZES.medium,
  },
  playerName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small / 2,
  },
  playerDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  playerDetails: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small / 2,
  },
  teamName: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  categoryBadge: {
    backgroundColor: COLORS.yellowLight,
    paddingVertical: 2,
    paddingHorizontal: SIZES.small,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: SIZES.small - 1,
    color: COLORS.yellowDark,
    fontWeight: '500',
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

export default PlayersScreen;
