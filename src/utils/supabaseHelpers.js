import { supabase } from '../config/supabase';

// Team-related functions
export const fetchTeams = async () => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching teams:', error);
    return { data: null, error };
  }
};

export const fetchTeamById = async (teamId) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching team:', error);
    return { data: null, error };
  }
};

export const createTeam = async (teamData) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([{ ...teamData, created_at: new Date().toISOString() }])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating team:', error);
    return { data: null, error };
  }
};

// Player-related functions
export const fetchPlayers = async () => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        teams (
          id,
          name,
          category
        )
      `)
      .order('last_name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching players:', error);
    return { data: null, error };
  }
};

export const fetchPlayerById = async (playerId) => {
  try {
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
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching player:', error);
    return { data: null, error };
  }
};

export const createPlayer = async (playerData) => {
  try {
    const formattedData = {
      ...playerData,
      date_of_birth: playerData.date_of_birth.toISOString().split('T')[0],
      jersey_number: playerData.jersey_number ? parseInt(playerData.jersey_number) : null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('players')
      .insert([formattedData])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating player:', error);
    return { data: null, error };
  }
};

// Event-related functions
export const fetchEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: null, error };
  }
};

export const fetchEventById = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching event:', error);
    return { data: null, error };
  }
};

export const createEvent = async (eventData) => {
  try {
    const formattedData = {
      ...eventData,
      event_date: eventData.event_date.toISOString().split('T')[0],
      registration_deadline: eventData.registration_deadline.toISOString().split('T')[0],
      max_teams: eventData.max_teams ? parseInt(eventData.max_teams) : null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('events')
      .insert([formattedData])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating event:', error);
    return { data: null, error };
  }
};

// Announcement-related functions
export const fetchAnnouncements = async () => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return { data: null, error };
  }
};

export const createAnnouncement = async (announcementData) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert([{ ...announcementData, created_at: new Date().toISOString() }])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating announcement:', error);
    return { data: null, error };
  }
};

// Event registration functions
export const registerTeamForEvent = async (eventId, teamId, notes = '') => {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{
        event_id: eventId,
        team_id: teamId,
        registration_date: new Date().toISOString(),
        status: 'confirmed',
        notes
      }])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error registering team for event:', error);
    return { data: null, error };
  }
};

export const fetchTeamsForEvent = async (eventId) => {
  try {
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
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching teams for event:', error);
    return { data: null, error };
  }
};

// Utility functions
export const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const calculateAge = (dateString) => {
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
