import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate a unique ID for new records
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Format date to ISO string
const formatDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString();
};

// Local database implementation using AsyncStorage
const localDatabase = {
  // Initialize database with default data
  async initialize() {
    try {
      // Check if database is already initialized
      const initialized = await AsyncStorage.getItem('db_initialized');
      if (initialized) return;

      // Create empty collections
      await AsyncStorage.setItem('teams', JSON.stringify([]));
      await AsyncStorage.setItem('players', JSON.stringify([]));
      await AsyncStorage.setItem('events', JSON.stringify([]));
      await AsyncStorage.setItem('event_registrations', JSON.stringify([]));
      await AsyncStorage.setItem('announcements', JSON.stringify([]));
      
      // Mark as initialized
      await AsyncStorage.setItem('db_initialized', 'true');
      console.log('Local database initialized');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  },

  // Get all items from a collection
  async getAll(collection) {
    try {
      console.log(`Getting all items from ${collection}...`);
      const data = await AsyncStorage.getItem(collection);
      console.log(`Data retrieved from ${collection}:`, data ? `${data.substring(0, 50)}...` : 'null or empty');
      
      let parsed = [];
      
      try {
        parsed = JSON.parse(data) || [];
        console.log(`Successfully parsed ${collection} data, found ${parsed.length} items`);
      } catch (parseError) {
        console.error(`Error parsing ${collection} data:`, parseError);
        parsed = [];
      }
      
      return { data: parsed, error: null };
    } catch (error) {
      console.error(`Error getting ${collection}:`, error);
      return { data: [], error };
    }
  },

  // Get a single item by ID
  async getById(collection, id) {
    try {
      const data = await AsyncStorage.getItem(collection);
      const items = JSON.parse(data) || [];
      const item = items.find(item => item.id === id);
      return { data: item || null, error: null };
    } catch (error) {
      console.error(`Error getting ${collection} by ID:`, error);
      return { data: null, error };
    }
  },

  // Get items by a field value
  async getByField(collection, field, value) {
    try {
      const data = await AsyncStorage.getItem(collection);
      const items = JSON.parse(data) || [];
      const filteredItems = items.filter(item => item[field] === value);
      return { data: filteredItems, error: null };
    } catch (error) {
      console.error(`Error getting ${collection} by field:`, error);
      return { data: [], error };
    }
  },

  // Create a new item
  async create(collection, item) {
    try {
      console.log(`Creating new item in ${collection}...`);
      const storageData = await AsyncStorage.getItem(collection);
      console.log(`Retrieved existing data from ${collection}:`, storageData ? 'Data found' : 'No data found');
      let items = [];
      
      try {
        items = JSON.parse(storageData) || [];
      } catch (parseError) {
        console.error(`Error parsing ${collection} data:`, parseError);
        items = [];
      }
      
      // Add ID and created_at if not provided
      const newItem = {
        ...item,
        id: item.id || generateId(),
        created_at: item.created_at || new Date().toISOString()
      };
      
      // Format dates if present
      if (newItem.date_of_birth) {
        newItem.date_of_birth = formatDate(newItem.date_of_birth);
      }
      if (newItem.event_date) {
        newItem.event_date = formatDate(newItem.event_date);
      }
      if (newItem.registration_deadline) {
        newItem.registration_deadline = formatDate(newItem.registration_deadline);
      }
      
      // Add to collection
      items.push(newItem);
      
      console.log(`Saving updated ${collection} collection with new item:`, newItem.id);
      await AsyncStorage.setItem(collection, JSON.stringify(items));
      console.log(`Successfully saved ${collection} data`);
      
      return { data: newItem, error: null };
    } catch (error) {
      console.error(`Error creating ${collection}:`, error);
      return { data: null, error };
    }
  },

  // Update an item
  async update(collection, id, updates) {
    try {
      const data = await AsyncStorage.getItem(collection);
      const items = JSON.parse(data) || [];
      
      // Find item index
      const index = items.findIndex(item => item.id === id);
      if (index === -1) {
        return { data: null, error: new Error('Item not found') };
      }
      
      // Update item
      const updatedItem = { ...items[index], ...updates };
      items[index] = updatedItem;
      
      await AsyncStorage.setItem(collection, JSON.stringify(items));
      return { data: updatedItem, error: null };
    } catch (error) {
      console.error(`Error updating ${collection}:`, error);
      return { data: null, error };
    }
  },

  // Delete an item
  async delete(collection, id) {
    try {
      const data = await AsyncStorage.getItem(collection);
      const items = JSON.parse(data) || [];
      
      // Filter out the item to delete
      const newItems = items.filter(item => item.id !== id);
      await AsyncStorage.setItem(collection, JSON.stringify(newItems));
      
      return { data: { id }, error: null };
    } catch (error) {
      console.error(`Error deleting ${collection}:`, error);
      return { data: null, error };
    }
  },

  // Clear all data (for testing)
  async clearAll() {
    try {
      await AsyncStorage.clear();
      console.log('Database cleared');
      return { error: null };
    } catch (error) {
      console.error('Error clearing database:', error);
      return { error };
    }
  }
};

// Create a Supabase-like API for easier migration
export const db = {
  from: (collection) => ({
    select: (columns = '*') => ({
      get: async () => {
        console.log(`DB API: Calling get() for collection: ${collection}`);
        const result = await localDatabase.getAll(collection);
        console.log(`DB API: get() result for ${collection}:`, result);
        return result;
      },
      eq: (field, value) => ({
        // Support for eq().single()
        single: async () => {
          const { data, error } = await localDatabase.getByField(collection, field, value);
          return { data: data && data.length > 0 ? data[0] : null, error };
        },
        // Support for eq().order()
        order: (column, { ascending = true } = {}) => ({
          get: async () => {
            const { data, error } = await localDatabase.getByField(collection, field, value);
            if (error) return { data: null, error };
            
            // Sort data
            const sortedData = [...data].sort((a, b) => {
              if (a[column] < b[column]) return ascending ? -1 : 1;
              if (a[column] > b[column]) return ascending ? 1 : -1;
              return 0;
            });
            
            return { data: sortedData, error: null };
          }
        }),
        // Basic eq() function
        get: async () => localDatabase.getByField(collection, field, value)
      }),
      single: async () => {
        const { data, error } = await localDatabase.getAll(collection);
        return { data: data && data.length > 0 ? data[0] : null, error };
      },
      order: (column, { ascending = true } = {}) => ({
        limit: async (limit) => {
          const { data, error } = await localDatabase.getAll(collection);
          if (error) return { data: null, error };
          
          // Sort data
          const sortedData = [...data].sort((a, b) => {
            if (a[column] < b[column]) return ascending ? -1 : 1;
            if (a[column] > b[column]) return ascending ? 1 : -1;
            return 0;
          });
          
          // Apply limit
          return { data: sortedData.slice(0, limit), error: null };
        },
        eq: (field, value) => ({
          get: async () => {
            const { data, error } = await localDatabase.getByField(collection, field, value);
            if (error) return { data: null, error };
            
            // Sort data
            const sortedData = [...data].sort((a, b) => {
              if (a[column] < b[column]) return ascending ? -1 : 1;
              if (a[column] > b[column]) return ascending ? 1 : -1;
              return 0;
            });
            
            return { data: sortedData, error: null };
          }
        }),
        get: async () => {
          const { data, error } = await localDatabase.getAll(collection);
          if (error) return { data: null, error };
          
          // Sort data
          const sortedData = [...data].sort((a, b) => {
            if (a[column] < b[column]) return ascending ? -1 : 1;
            if (a[column] > b[column]) return ascending ? 1 : -1;
            return 0;
          });
          
          return { data: sortedData, error: null };
        }
      })
    }),
    insert: (rows) => {
      // Return an object with a select method to support chaining
      return {
        select: async () => {
          console.log(`DB API: insert().select() called for collection: ${collection}`);
          // Handle both single object and array
          const itemsToInsert = Array.isArray(rows) ? rows : [rows];
          console.log(`DB API: Inserting ${itemsToInsert.length} items`);
          
          const results = [];
          let error = null;
          
          for (const item of itemsToInsert) {
            console.log(`DB API: Creating item in ${collection}:`, item);
            const { data, error: itemError } = await localDatabase.create(collection, item);
            
            if (itemError) {
              console.error(`DB API: Error inserting item:`, itemError);
              error = itemError;
              break;
            }
            
            if (data) {
              console.log(`DB API: Successfully created item with ID:`, data.id);
              results.push(data);
            }
          }
          
          // Re-verify that data was saved by checking AsyncStorage directly
          try {
            const checkData = await AsyncStorage.getItem(collection);
            const parsedData = JSON.parse(checkData || '[]');
            console.log(`DB API: Verification - ${collection} now has ${parsedData.length} items`);
          } catch (verifyError) {
            console.error(`DB API: Verification error:`, verifyError);
          }
          
          return { data: results, error };
        }
      };
    },
    update: (updates) => ({
      eq: async (field, value) => {
        // First get items matching the field
        const { data: items, error: findError } = await localDatabase.getByField(collection, field, value);
        if (findError) return { data: null, error: findError };
        
        // Update each item
        const updatedItems = [];
        let error = null;
        
        for (const item of items) {
          const { data, error: updateError } = await localDatabase.update(collection, item.id, updates);
          if (updateError) {
            error = updateError;
            break;
          }
          if (data) updatedItems.push(data);
        }
        
        return { data: updatedItems, error };
      }
    }),
    delete: () => ({
      eq: async (field, value) => {
        // First get items matching the field
        const { data: items, error: findError } = await localDatabase.getByField(collection, field, value);
        if (findError) return { data: null, error: findError };
        
        // Delete each item
        const deletedIds = [];
        let error = null;
        
        for (const item of items) {
          const { data, error: deleteError } = await localDatabase.delete(collection, item.id);
          if (deleteError) {
            error = deleteError;
            break;
          }
          if (data) deletedIds.push(data.id);
        }
        
        return { data: { ids: deletedIds }, error };
      }
    })
  }),
  
  // Initialize the database
  initialize: async () => {
    console.log("Explicitly calling database initialize");
    return await localDatabase.initialize();
  },
  
  // Clear all data (for testing)
  clearAll: localDatabase.clearAll
};

// Initialize the database on import
db.initialize();
