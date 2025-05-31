import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { COLORS, SIZES, SHADOWS } from '../config/theme';

const PlayerRegistrationScreen = ({ route, navigation }) => {
  const { teamId } = route.params || {};
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: new Date(),
    gender: 'Male',
    position: '',
    jersey_number: '',
    contact_number: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    team_id: teamId || '',
    additional_info: ''
  });
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const positions = [
    'Goalkeeper',
    'Defender',
    'Midfielder',
    'Forward',
    'Coach',
    'Manager',
    'Other'
  ];

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setTeamsLoading(true);
      // Get all teams from local database
      const { data, error } = await supabase.from('teams').select('*').get();

      if (error) throw error;
      
      // Sort teams by name
      const sortedTeams = [...(data || [])].sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      
      console.log('Available teams for player registration:', sortedTeams);
      setTeams(sortedTeams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      Alert.alert('Error', 'Failed to load teams');
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleChange('date_of_birth', selectedDate);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.team_id) {
      newErrors.team_id = 'Please select a team';
    }
    
    if (formData.contact_number && !/^\+?[0-9\s-]{8,15}$/.test(formData.contact_number.trim())) {
      newErrors.contact_number = 'Please enter a valid phone number';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.emergency_contact_number && 
        !/^\+?[0-9\s-]{8,15}$/.test(formData.emergency_contact_number.trim())) {
      newErrors.emergency_contact_number = 'Please enter a valid phone number';
    }
    
    if (formData.jersey_number && !/^[0-9]{1,3}$/.test(formData.jersey_number.trim())) {
      newErrors.jersey_number = 'Jersey number must be between 1 and 999';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Format the data for Supabase
      const playerData = {
        ...formData,
        date_of_birth: formData.date_of_birth.toISOString().split('T')[0],
        jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select();
      
      if (error) throw error;
      
      Alert.alert(
        'Success',
        'Player registered successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (data && data.length > 0) {
                navigation.navigate('PlayerDetails', { playerId: data[0].id });
              } else {
                navigation.goBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error registering player:', error);
      Alert.alert('Error', 'Failed to register player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Register New Player</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={[styles.input, errors.first_name && styles.inputError]}
            value={formData.first_name}
            onChangeText={(text) => handleChange('first_name', text)}
            placeholder="Enter first name"
            placeholderTextColor={COLORS.textLight}
          />
          {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={[styles.input, errors.last_name && styles.inputError]}
            value={formData.last_name}
            onChangeText={(text) => handleChange('last_name', text)}
            placeholder="Enter last name"
            placeholderTextColor={COLORS.textLight}
          />
          {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.date_of_birth.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.date_of_birth}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity 
            style={styles.dropdownSelector}
            onPress={() => {
              Alert.alert(
                'Select Gender',
                'Choose player gender',
                [
                  { text: 'Male', onPress: () => handleChange('gender', 'Male') },
                  { text: 'Female', onPress: () => handleChange('gender', 'Female') },
                  { text: 'Other', onPress: () => handleChange('gender', 'Other') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <View style={styles.dropdownContent}>
              <Text style={styles.selectedValue}>{formData.gender}</Text>
            </View>
            <View style={styles.dropdownIcon}>
              <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
              <Text style={styles.dropdownText}>Tap to change</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.helperText}>Tap to select gender</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Team *</Text>
          <TouchableOpacity 
            style={[styles.dropdownSelector, errors.team_id && styles.inputError]}
            onPress={() => {
              if (teamId) return; // Don't show picker if teamId was passed
              if (teamsLoading) return; // Don't show picker if teams are still loading
              
              Alert.alert(
                'Select Team',
                'Choose player team',
                [
                  ...teams.map(team => ({
                    text: `${team.name} (${team.category})`,
                    onPress: () => handleChange('team_id', team.id)
                  })),
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
            disabled={!!teamId} // Disable if teamId was passed from parent screen
          >
            <View style={styles.dropdownContent}>
              {teamsLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.selectedValue}>
                  {formData.team_id 
                    ? teams.find(t => t.id === formData.team_id)
                      ? `${teams.find(t => t.id === formData.team_id).name} (${teams.find(t => t.id === formData.team_id).category})` 
                      : 'Select a team'
                    : 'Select a team'}
                </Text>
              )}
            </View>
            <View style={styles.dropdownIcon}>
              <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
              <Text style={styles.dropdownText}>Tap to select</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.helperText}>Tap to select team</Text>
          {errors.team_id && <Text style={styles.errorText}>{errors.team_id}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Position</Text>
          <TouchableOpacity 
            style={styles.dropdownSelector}
            onPress={() => {
              Alert.alert(
                'Select Position',
                'Choose player position',
                [
                  ...positions.map(position => ({
                    text: position,
                    onPress: () => handleChange('position', position)
                  })),
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <View style={styles.dropdownContent}>
              <Text style={styles.selectedValue}>
                {formData.position || 'Select a position'}
              </Text>
            </View>
            <View style={styles.dropdownIcon}>
              <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
              <Text style={styles.dropdownText}>Tap to select</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.helperText}>Tap to select position</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Jersey Number</Text>
          <TextInput
            style={[styles.input, errors.jersey_number && styles.inputError]}
            value={formData.jersey_number}
            onChangeText={(text) => handleChange('jersey_number', text)}
            placeholder="Enter jersey number"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
            maxLength={3}
          />
          {errors.jersey_number && <Text style={styles.errorText}>{errors.jersey_number}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={[styles.input, errors.contact_number && styles.inputError]}
            value={formData.contact_number}
            onChangeText={(text) => handleChange('contact_number', text)}
            placeholder="Enter contact number"
            placeholderTextColor={COLORS.textLight}
            keyboardType="phone-pad"
          />
          {errors.contact_number && <Text style={styles.errorText}>{errors.contact_number}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="Enter email address"
            placeholderTextColor={COLORS.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Emergency Contact Name</Text>
          <TextInput
            style={styles.input}
            value={formData.emergency_contact_name}
            onChangeText={(text) => handleChange('emergency_contact_name', text)}
            placeholder="Enter emergency contact name"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Emergency Contact Number</Text>
          <TextInput
            style={[styles.input, errors.emergency_contact_number && styles.inputError]}
            value={formData.emergency_contact_number}
            onChangeText={(text) => handleChange('emergency_contact_number', text)}
            placeholder="Enter emergency contact number"
            placeholderTextColor={COLORS.textLight}
            keyboardType="phone-pad"
          />
          {errors.emergency_contact_number && (
            <Text style={styles.errorText}>{errors.emergency_contact_number}</Text>
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Additional Information</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.additional_info}
            onChangeText={(text) => handleChange('additional_info', text)}
            placeholder="Enter any additional information"
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.background} />
          ) : (
            <Text style={styles.buttonText}>Register Player</Text>
          )}
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
  formContainer: {
    padding: SIZES.medium,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: SIZES.medium,
  },
  label: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.base,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.background,
    minHeight: 50,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedValue: {
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: '500',
  },
  dropdownIcon: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginTop: 2,
  },
  helperText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginTop: 5,
    marginLeft: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    overflow: 'hidden',
    display: 'none', // Hide the original picker
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerLoader: {
    padding: 15,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
  },
  dateText: {
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.small,
    marginTop: SIZES.base / 2,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: 'center',
    marginTop: SIZES.medium,
    ...SHADOWS.small,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: SIZES.medium,
  },
});

export default PlayerRegistrationScreen;
