import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { Card, Divider } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { COLORS, SIZES, SHADOWS } from '../config/theme';

const TeamDetailsScreen = ({ route, navigation }) => {
  const { teamId } = route.params;
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(true);

  useEffect(() => {
    fetchTeamDetails();
    fetchTeamPlayers();
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      console.log(`Fetching team details for ID: ${teamId}`);
      
      // Get all teams first with explicit get() call
      const { data: allTeams, error: teamsError } = await supabase.from('teams').select('*').get();
      
      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        throw teamsError;
      }
      
      console.log(`Retrieved ${allTeams ? allTeams.length : 0} teams`);
      
      // Find the team with the matching ID
      const teamData = allTeams && Array.isArray(allTeams) ? 
        allTeams.find(t => t.id === teamId) : null;
      
      if (!teamData) {
        console.error('Team not found with ID:', teamId);
        throw new Error('Team not found');
      }
      
      console.log('Found team data:', teamData.name);
      setTeam(teamData);
    } catch (error) {
      console.error('Error fetching team details:', error);
      Alert.alert('Error', 'Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamPlayers = async () => {
    try {
      setPlayersLoading(true);
      console.log(`Fetching players for team ID: ${teamId}`);
      
      // Get all players with explicit get() call
      const { data: allPlayers, error: playersError } = await supabase.from('players').select('*').get();
      
      if (playersError) {
        console.error('Error fetching players:', playersError);
        throw playersError;
      }
      
      if (!allPlayers || !Array.isArray(allPlayers)) {
        console.log('No players data found or invalid format');
        setPlayers([]);
        return;
      }
      
      console.log(`Retrieved ${allPlayers.length} total players`);
      
      // Filter players by team_id
      const teamPlayers = allPlayers.filter(player => player.team_id === teamId);
      console.log(`Found ${teamPlayers.length} players for this team`);
      
      // Sort players by jersey number if available
      const sortedPlayers = teamPlayers.sort((a, b) => {
        const jerseyA = a.jersey_number || 0;
        const jerseyB = b.jersey_number || 0;
        return jerseyA - jerseyB;
      });
      
      setPlayers(sortedPlayers || []);
    } catch (error) {
      console.error('Error fetching team players:', error);
      setPlayers([]);
    } finally {
      setPlayersLoading(false);
    }
  };

  const handleAddPlayer = () => {
    navigation.navigate('PlayersTab', {
      screen: 'PlayerRegistration',
      params: { teamId }
    });
  };

  const renderPlayerItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PlayersTab', {
        screen: 'PlayerDetails',
        params: { playerId: item.id }
      })}
    >
      <View style={styles.playerItem}>
        <View style={styles.jerseyNumber}>
          <Text style={styles.jerseyNumberText}>{item.jersey_number || '-'}</Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.playerPosition}>{item.position || 'Position not specified'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!team) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Team not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Text style={styles.teamName}>{team.name}</Text>
        <Text style={styles.teamCategory}>{team.category}</Text>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Team Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Home Venue:</Text>
            <Text style={styles.infoValue}>{team.home_venue || 'Not specified'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Team Colors:</Text>
            <Text style={styles.infoValue}>{team.team_colors || 'Not specified'}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Staff</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coach:</Text>
            <Text style={styles.infoValue}>{team.coach_name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coach Contact:</Text>
            <Text style={styles.infoValue}>{team.coach_contact}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Manager:</Text>
            <Text style={styles.infoValue}>{team.manager_name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Manager Contact:</Text>
            <Text style={styles.infoValue}>{team.manager_contact}</Text>
          </View>
        </View>
        
        {team.additional_info && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              <Text style={styles.additionalInfo}>{team.additional_info}</Text>
            </View>
          </>
        )}
      </Card>

      <View style={styles.playersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Team Players</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPlayer}
          >
            <Ionicons name="add" size={18} color={COLORS.background} />
            <Text style={styles.addButtonText}>Add Player</Text>
          </TouchableOpacity>
        </View>

        {playersLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.playersLoader} />
        ) : players.length > 0 ? (
          <FlatList
            data={players}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPlayerItem}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyPlayersContainer}>
            <Text style={styles.emptyPlayersText}>No players registered for this team</Text>
            <TouchableOpacity
              style={styles.registerPlayerButton}
              onPress={handleAddPlayer}
            >
              <Text style={styles.registerPlayerButtonText}>Register Player</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: SIZES.large,
    color: COLORS.error,
    marginBottom: SIZES.medium,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
  },
  backButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: SIZES.base,
    marginHorizontal: SIZES.medium,
    marginTop: SIZES.medium,
    marginBottom: SIZES.small,
    padding: SIZES.medium,
    ...SHADOWS.small,
    borderColor: COLORS.border,
  },
  teamName: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  teamCategory: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginBottom: SIZES.medium,
  },
  divider: {
    backgroundColor: COLORS.border,
    marginVertical: SIZES.medium,
  },
  infoSection: {
    marginBottom: SIZES.small,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SIZES.small,
  },
  infoLabel: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.text,
    width: '35%',
  },
  infoValue: {
    fontSize: SIZES.font,
    color: COLORS.text,
    flex: 1,
  },
  additionalInfo: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 22,
  },
  playersSection: {
    marginHorizontal: SIZES.medium,
    marginVertical: SIZES.medium,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  sectionHeaderTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  jerseyNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  jerseyNumberText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: SIZES.font,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  playerPosition: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  playersLoader: {
    padding: SIZES.large,
  },
  emptyPlayersContainer: {
    padding: SIZES.large,
    alignItems: 'center',
  },
  emptyPlayersText: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  registerPlayerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.base,
  },
  registerPlayerButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
});

export default TeamDetailsScreen;
