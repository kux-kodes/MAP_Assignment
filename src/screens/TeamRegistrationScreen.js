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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../config/supabase';
import { COLORS, SIZES, SHADOWS } from '../config/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeamRegistrationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Senior Men', // Default category
    coach_name: '',
    coach_contact: '',
    manager_name: '',
    manager_contact: '',
    home_venue: '',
    team_colors: '',
    additional_info: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
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
  
  // Make sure the default category is valid
  useEffect(() => {
    // Log available categories for debugging
    console.log('Available categories:', categories);
  }, []);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }
    
    if (!formData.coach_name.trim()) {
      newErrors.coach_name = 'Coach name is required';
    }
    
    if (!formData.coach_contact.trim()) {
      newErrors.coach_contact = 'Coach contact is required';
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(formData.coach_contact.trim())) {
      newErrors.coach_contact = 'Please enter a valid phone number';
    }
    
    if (!formData.manager_name.trim()) {
      newErrors.manager_name = 'Manager name is required';
    }
    
    if (!formData.manager_contact.trim()) {
      newErrors.manager_contact = 'Manager contact is required';
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(formData.manager_contact.trim())) {
      newErrors.manager_contact = 'Please enter a valid phone number';
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
      console.log('Starting team registration...');
      console.log('Team data:', formData);
      
      const { data, error } = await supabase
        .from('teams')
        .insert([
          { 
            ...formData,
            created_at: new Date().toISOString(),
            player_count: 0
          }
        ])
        .select();
      
      if (error) {
        console.error('Error in team registration:', error);
        throw error;
      }
      
      console.log('Team registration successful:', data);

      // Verify that team was actually saved to AsyncStorage
      try {
        const rawData = await AsyncStorage.getItem('teams');
        const storedTeams = JSON.parse(rawData) || [];
        const teamExists = data && data[0] && storedTeams.some(team => team.id === data[0].id);
        
        console.log('Verification - Teams in storage:', storedTeams.length);
        console.log('Verification - New team exists in storage:', teamExists);
        
        if (!teamExists && data && data[0]) {
          console.warn('Team not found in storage, attempting manual save');
          // If not found, try to manually save it as a fallback
          storedTeams.push(data[0]);
          await AsyncStorage.setItem('teams', JSON.stringify(storedTeams));
          console.log('Manual save completed');
        }
      } catch (verifyError) {
        console.error('Error verifying team storage:', verifyError);
      }
      
      Alert.alert(
        'Success',
        'Team registered successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              if (data && data.length > 0) {
                console.log('Navigating to TeamDetails with id:', data[0].id);
                navigation.navigate('TeamDetails', { teamId: data[0].id });
              } else {
                console.log('No data returned, navigating back');
                navigation.goBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error registering team:', error);
      Alert.alert('Error', 'Failed to register team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Register New Team</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Team Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder="Enter team name"
              placeholderTextColor={COLORS.textLight}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity 
              style={[styles.categorySelector, errors.category && styles.inputError]}
              onPress={() => {
                // Create an array of buttons for each category
                const buttons = categories.map(category => ({
                  text: category,
                  onPress: () => handleChange('category', category)
                }));
                
                // Add a cancel button
                buttons.push({ text: 'Cancel', style: 'cancel' });
                
                Alert.alert(
                  'Select Category',
                  'Choose a team category',
                  buttons
                );
              }}
            >
              <View style={styles.categoryContent}>
                <Text style={styles.selectedCategoryLabel}>Selected: </Text>
                <Text style={styles.selectedCategory}>{formData.category}</Text>
              </View>
              <View style={styles.dropdownIcon}>
                <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
                <Text style={styles.dropdownText}>Tap to change</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Coach Name *</Text>
            <TextInput
              style={[styles.input, errors.coach_name && styles.inputError]}
              value={formData.coach_name}
              onChangeText={(text) => handleChange('coach_name', text)}
              placeholder="Enter coach name"
              placeholderTextColor={COLORS.textLight}
            />
            {errors.coach_name && <Text style={styles.errorText}>{errors.coach_name}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Coach Contact *</Text>
            <TextInput
              style={[styles.input, errors.coach_contact && styles.inputError]}
              value={formData.coach_contact}
              onChangeText={(text) => handleChange('coach_contact', text)}
              placeholder="Enter coach phone number"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
            />
            {errors.coach_contact && <Text style={styles.errorText}>{errors.coach_contact}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Manager Name *</Text>
            <TextInput
              style={[styles.input, errors.manager_name && styles.inputError]}
              value={formData.manager_name}
              onChangeText={(text) => handleChange('manager_name', text)}
              placeholder="Enter manager name"
              placeholderTextColor={COLORS.textLight}
            />
            {errors.manager_name && <Text style={styles.errorText}>{errors.manager_name}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Manager Contact *</Text>
            <TextInput
              style={[styles.input, errors.manager_contact && styles.inputError]}
              value={formData.manager_contact}
              onChangeText={(text) => handleChange('manager_contact', text)}
              placeholder="Enter manager phone number"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
            />
            {errors.manager_contact && <Text style={styles.errorText}>{errors.manager_contact}</Text>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Home Venue</Text>
            <TextInput
              style={styles.input}
              value={formData.home_venue}
              onChangeText={(text) => handleChange('home_venue', text)}
              placeholder="Enter home venue"
              placeholderTextColor={COLORS.textLight}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Team Colors</Text>
            <TextInput
              style={styles.input}
              value={formData.team_colors}
              onChangeText={(text) => handleChange('team_colors', text)}
              placeholder="Enter team colors (e.g., Blue/White)"
              placeholderTextColor={COLORS.textLight}
            />
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
              <Text style={styles.buttonText}>Register Team</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.background} />
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
    paddingTop: SIZES.large,
    paddingBottom: SIZES.extraLarge,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
    marginTop: -20,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    margin: SIZES.medium,
    borderRadius: 16,
    padding: SIZES.large,
    ...SHADOWS.small,
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
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    padding: SIZES.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.base,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.surfaceLight,
    minHeight: 60,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategoryLabel: {
    fontSize: SIZES.font,
    color: COLORS.textLight,
    marginRight: 5,
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
  selectedCategory: {
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: '500',
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
  backButton: {
    position: 'absolute',
    top: SIZES.medium,
    left: SIZES.medium,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TeamRegistrationScreen;
