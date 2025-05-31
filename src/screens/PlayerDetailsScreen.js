import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Card, Divider } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { COLORS, SIZES, SHADOWS } from '../config/theme';

const PlayerDetailsScreen = ({ route, navigation }) => {
  const { playerId } = route.params;
  const [player, setPlayer] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayerDetails();
  }, [playerId]);

  const fetchPlayerDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          teams (
            id,
            name,
            category,
            coach_name,
            manager_name
          )
        `)
        .eq('id', playerId)
        .single();

      if (error) throw error;
      
      setPlayer(data);
      setTeam(data.teams);
    } catch (error) {
      console.error('Error fetching player details:', error);
      Alert.alert('Error', 'Failed to load player details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const calculateAge = (dateString) => {
    if (!dateString) return '';
    
    const birthDate = new Date(dateString);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Player not found</Text>
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
        <View style={styles.header}>
          {player.jersey_number && (
            <View style={styles.jerseyNumber}>
              <Text style={styles.jerseyNumberText}>{player.jersey_number}</Text>
            </View>
          )}
          <View style={styles.nameContainer}>
            <Text style={styles.playerName}>{player.first_name} {player.last_name}</Text>
            <Text style={styles.position}>{player.position || 'Position not specified'}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth:</Text>
            <Text style={styles.infoValue}>
              {formatDate(player.date_of_birth)}
              {player.date_of_birth && ` (${calculateAge(player.date_of_birth)} years)`}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoValue}>{player.gender || 'Not specified'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact:</Text>
            <Text style={styles.infoValue}>{player.contact_number || 'Not specified'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{player.email || 'Not specified'}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{player.emergency_contact_name || 'Not specified'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact:</Text>
            <Text style={styles.infoValue}>{player.emergency_contact_number || 'Not specified'}</Text>
          </View>
        </View>
        
        {team && (
          <>
            <Divider style={styles.divider} />
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Team Information</Text>
              
              <TouchableOpacity 
                style={styles.teamContainer}
                onPress={() => navigation.navigate('TeamDetails', { teamId: team.id })}
              >
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <Text style={styles.teamCategory}>{team.category}</Text>
                  <Text style={styles.teamStaff}>Coach: {team.coach_name}</Text>
                  <Text style={styles.teamStaff}>Manager: {team.manager_name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </>
        )}
        
        {player.additional_info && (
          <>
            <Divider style={styles.divider} />
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              <Text style={styles.additionalInfo}>{player.additional_info}</Text>
            </View>
          </>
        )}
      </Card>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => Alert.alert('Info', 'Edit functionality will be implemented in future updates')}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.background} />
          <Text style={styles.buttonText}>Edit Player</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  jerseyNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  jerseyNumberText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: SIZES.large,
  },
  nameContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.small / 2,
  },
  position: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: 'bold',
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
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.medium,
    backgroundColor: '#F8F8F8',
    borderRadius: SIZES.base,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.small / 2,
  },
  teamCategory: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SIZES.small / 2,
  },
  teamStaff: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  additionalInfo: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SIZES.medium,
    paddingHorizontal: SIZES.medium,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    ...SHADOWS.small,
    flex: 1,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    marginLeft: SIZES.small,
  },
});

export default PlayerDetailsScreen;
