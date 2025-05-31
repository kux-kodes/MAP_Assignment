// Simple REST API client for Supabase without dependencies
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ydfdjhbxaoqzhangllsx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZmRqaGJ4YW9xemhhbmdsbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTA5NTMsImV4cCI6MjA2MjU2Njk1M30.XmgG9DfmCu6ijhmUkSNC4GGQgzNn12lTMylO7Z_cwaQ';

// Helper function to make API requests to Supabase
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${SUPABASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API request error:', error);
    return { data: null, error };
  }
};

// Simple Supabase client implementation
export const supabase = {
  // Database methods
  from: (table) => ({
    select: (columns = '*') => ({
      // Get all records
      async get() {
        return apiRequest(`/rest/v1/${table}?select=${columns}`, {
          method: 'GET',
        });
      },
      // Filter by equality
      async eq(column, value) {
        return apiRequest(`/rest/v1/${table}?select=${columns}&${column}=eq.${value}`, {
          method: 'GET',
        });
      },
      // Get a single record
      async single() {
        const { data, error } = await apiRequest(`/rest/v1/${table}?select=${columns}&limit=1`, {
          method: 'GET',
        });
        return { 
          data: data && data.length > 0 ? data[0] : null, 
          error 
        };
      },
      // Order records
      order(column, { ascending = true } = {}) {
        const direction = ascending ? 'asc' : 'desc';
        return {
          // Limit results
          async limit(limit) {
            return apiRequest(`/rest/v1/${table}?select=${columns}&order=${column}.${direction}&limit=${limit}`, {
              method: 'GET',
            });
          },
          // Filter ordered results
          async eq(col, val) {
            return apiRequest(`/rest/v1/${table}?select=${columns}&${col}=eq.${val}&order=${column}.${direction}`, {
              method: 'GET',
            });
          },
          // Get all ordered results
          async get() {
            return apiRequest(`/rest/v1/${table}?select=${columns}&order=${column}.${direction}`, {
              method: 'GET',
            });
          },
        };
      },
    }),
    // Insert records
    async insert(rows) {
      return apiRequest(`/rest/v1/${table}`, {
        method: 'POST',
        body: JSON.stringify(rows),
        headers: {
          'Prefer': 'return=representation',
        },
      });
    },
    // Update records
    update(updates) {
      return {
        async eq(column, value) {
          return apiRequest(`/rest/v1/${table}?${column}=eq.${value}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
            headers: {
              'Prefer': 'return=representation',
            },
          });
        },
      };
    },
    // Delete records
    delete() {
      return {
        async eq(column, value) {
          return apiRequest(`/rest/v1/${table}?${column}=eq.${value}`, {
            method: 'DELETE',
            headers: {
              'Prefer': 'return=representation',
            },
          });
        },
      };
    },
  }),
  
  // Simple auth methods
  auth: {
    // Store user session in AsyncStorage
    async storeSession(session) {
      try {
        await AsyncStorage.setItem('supabase_session', JSON.stringify(session));
        return { error: null };
      } catch (error) {
        console.error('Error storing session:', error);
        return { error };
      }
    },
    // Get user session from AsyncStorage
    async getSession() {
      try {
        const sessionStr = await AsyncStorage.getItem('supabase_session');
        return { session: sessionStr ? JSON.parse(sessionStr) : null, error: null };
      } catch (error) {
        console.error('Error getting session:', error);
        return { session: null, error };
      }
    },
    // Sign in user
    async signIn({ email, password }) {
      return apiRequest('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    // Sign up user
    async signUp({ email, password }) {
      return apiRequest('/auth/v1/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    // Sign out user
    async signOut() {
      try {
        await AsyncStorage.removeItem('supabase_session');
        return { error: null };
      } catch (error) {
        console.error('Error signing out:', error);
        return { error };
      }
    },
  },
};
