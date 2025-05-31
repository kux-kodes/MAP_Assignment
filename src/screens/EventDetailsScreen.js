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

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
    fetchRegisteredTeams();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredTeams = async () => {
    try {
      setTeamsLoading(true);
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          teams (
            id,
            name,
            category
          )
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      
      const teamsData = data?.map(registration => registration.teams) || [];
      setRegisteredTeams(teamsData);
    } catch (error) {
      console.error('Error fetching registered teams:', error);
    } finally {
      setTeamsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isRegistrationOpen = () => {
    if (!event || !event.registration_deadline) return false;
    
    const deadline = new Date(event.registration_deadline);
    const today = new Date();
    return deadline >= today;
  };

  const handleRegisterTeam = () => {
    // In a real app, this would navigate to a team selection screen
    Alert.alert('Info', 'Team registration functionality will be implemented in future updates');
  };

  const renderTeamItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TeamDetails', { teamId: item.id })}
    >
      <View style={styles.teamItem}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamCategory}>{item.category}</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
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

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isUpcoming = new Date(event.event_date) >= new Date();

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <Text style={styles.eventName}>{event.name}</Text>
          
          {isUpcoming && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Upcoming</Text>
            </View>
          )}
        </View>
        
        <View style={styles.eventMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <Text style={styles.metaText}>{formatDate(event.event_date)}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.metaText}>{event.event_type}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Registration Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Deadline:</Text>
            <Text style={styles.infoValue}>{formatDate(event.registration_deadline)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text 
              style={[
                styles.infoValue, 
                isRegistrationOpen() ? styles.openStatus : styles.closedStatus
              ]}
            >
              {isRegistrationOpen() ? 'Open' : 'Closed'}
            </Text>
          </View>
          
          {event.max_teams && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Max Teams:</Text>
              <Text style={styles.infoValue}>{event.max_teams}</Text>
            </View>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {event.contact_person && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact:</Text>
              <Text style={styles.infoValue}>{event.contact_person}</Text>
            </View>
          )}
          
          {event.contact_email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{event.contact_email}</Text>
            </View>
          )}
          
          {event.contact_phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{event.contact_phone}</Text>
            </View>
          )}
        </View>
        
        {event.additional_info && (
          <>
            <Divider style={styles.divider} />
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              <Text style={styles.additionalInfo}>{event.additional_info}</Text>
            </View>
          </>
        )}
      </Card>

      <View style={styles.teamsSection}>
        <View style={styles.teamsSectionHeader}>
          <Text style={styles.sectionTitle}>Registered Teams</Text>
          
          {isRegistrationOpen() && (
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegisterTeam}
            >
              <Ionicons name="add" size={16} color={COLORS.background} />
              <Text style={styles.registerButtonText}>Register Team</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {teamsLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.teamsLoader} />
        ) : registeredTeams.length > 0 ? (
          <FlatList
            data={registeredTeams}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTeamItem}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyTeamsContainer}>
            <Text style={styles.emptyTeamsText}>No teams registered yet</Text>
            
            {isRegistrationOpen() && (
              <TouchableOpacity
                style={styles.registerTeamButton}
                onPress={handleRegisterTeam}
              >
                <Text style={styles.registerTeamButtonText}>Register Your Team</Text>
              </TouchableOpacity>
            )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.medium,
  },
  eventName: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: SIZES.small,
  },
  statusBadgeText: {
    color: COLORS.background,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  eventMeta: {
    marginBottom: SIZES.medium,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small / 2,
  },
  metaText: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginLeft: SIZES.small,
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
  description: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 22,
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
  openStatus: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  closedStatus: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  additionalInfo: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: 22,
  },
  teamsSection: {
    marginHorizontal: SIZES.medium,
    marginVertical: SIZES.medium,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.medium,
  },
  teamsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: 'center',
  },
  registerButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  teamName: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  teamCategory: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginRight: SIZES.medium,
  },
  teamsLoader: {
    padding: SIZES.large,
  },
  emptyTeamsContainer: {
    padding: SIZES.large,
    alignItems: 'center',
  },
  emptyTeamsText: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  registerTeamButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.base,
  },
  registerTeamButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
});

export default EventDetailsScreen;
