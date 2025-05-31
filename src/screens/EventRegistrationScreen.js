import React, { useState } from 'react';
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

const EventRegistrationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    event_type: 'Tournament',
    event_date: new Date(),
    location: '',
    description: '',
    registration_deadline: new Date(),
    max_teams: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    additional_info: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [dateField, setDateField] = useState('');

  const eventTypes = [
    'Tournament',
    'League Match',
    'Friendly Match',
    'Training Camp',
    'Workshop',
    'Meeting',
    'Other'
  ];

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
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowDeadlinePicker(false);
    }
    
    if (selectedDate) {
      if (dateField === 'event_date') {
        handleChange('event_date', selectedDate);
      } else if (dateField === 'registration_deadline') {
        handleChange('registration_deadline', selectedDate);
      }
    }
  };

  const showDatePickerModal = (field) => {
    setDateField(field);
    if (field === 'event_date') {
      setShowDatePicker(true);
    } else if (field === 'registration_deadline') {
      setShowDeadlinePicker(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.max_teams && !/^[0-9]+$/.test(formData.max_teams.trim())) {
      newErrors.max_teams = 'Maximum teams must be a number';
    }
    
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email.trim())) {
      newErrors.contact_email = 'Please enter a valid email address';
    }
    
    if (formData.contact_phone && !/^\+?[0-9\s-]{8,15}$/.test(formData.contact_phone.trim())) {
      newErrors.contact_phone = 'Please enter a valid phone number';
    }
    
    // Check if registration deadline is before event date
    if (formData.registration_deadline > formData.event_date) {
      newErrors.registration_deadline = 'Registration deadline must be before event date';
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
      const eventData = {
        ...formData,
        event_date: formData.event_date.toISOString().split('T')[0],
        registration_deadline: formData.registration_deadline.toISOString().split('T')[0],
        max_teams: formData.max_teams ? parseInt(formData.max_teams) : null,
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select();
      
      if (error) throw error;
      
      Alert.alert(
        'Success',
        'Event registered successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (data && data.length > 0) {
                navigation.navigate('EventDetails', { eventId: data[0].id });
              } else {
                navigation.goBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error registering event:', error);
      Alert.alert('Error', 'Failed to register event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Register New Event</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Enter event name"
            placeholderTextColor={COLORS.textLight}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.event_type}
              onValueChange={(value) => handleChange('event_type', value)}
              style={styles.picker}
            >
              {eventTypes.map((type, index) => (
                <Picker.Item key={index} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Date *</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => showDatePickerModal('event_date')}
          >
            <Text style={styles.dateText}>
              {formData.event_date.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.event_date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={[styles.input, errors.location && styles.inputError]}
            value={formData.location}
            onChangeText={(text) => handleChange('location', text)}
            placeholder="Enter event location"
            placeholderTextColor={COLORS.textLight}
          />
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            placeholder="Enter event description"
            placeholderTextColor={COLORS.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Registration Deadline</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => showDatePickerModal('registration_deadline')}
          >
            <Text style={styles.dateText}>
              {formData.registration_deadline.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          {errors.registration_deadline && (
            <Text style={styles.errorText}>{errors.registration_deadline}</Text>
          )}
          {showDeadlinePicker && (
            <DateTimePicker
              value={formData.registration_deadline}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
              maximumDate={formData.event_date}
            />
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Maximum Teams</Text>
          <TextInput
            style={[styles.input, errors.max_teams && styles.inputError]}
            value={formData.max_teams}
            onChangeText={(text) => handleChange('max_teams', text)}
            placeholder="Enter maximum number of teams"
            placeholderTextColor={COLORS.textLight}
            keyboardType="numeric"
          />
          {errors.max_teams && <Text style={styles.errorText}>{errors.max_teams}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Person</Text>
          <TextInput
            style={styles.input}
            value={formData.contact_person}
            onChangeText={(text) => handleChange('contact_person', text)}
            placeholder="Enter contact person name"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Email</Text>
          <TextInput
            style={[styles.input, errors.contact_email && styles.inputError]}
            value={formData.contact_email}
            onChangeText={(text) => handleChange('contact_email', text)}
            placeholder="Enter contact email"
            placeholderTextColor={COLORS.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.contact_email && <Text style={styles.errorText}>{errors.contact_email}</Text>}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Phone</Text>
          <TextInput
            style={[styles.input, errors.contact_phone && styles.inputError]}
            value={formData.contact_phone}
            onChangeText={(text) => handleChange('contact_phone', text)}
            placeholder="Enter contact phone number"
            placeholderTextColor={COLORS.textLight}
            keyboardType="phone-pad"
          />
          {errors.contact_phone && <Text style={styles.errorText}>{errors.contact_phone}</Text>}
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
            <Text style={styles.buttonText}>Register Event</Text>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
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

export default EventRegistrationScreen;
