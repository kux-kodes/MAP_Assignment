// Import our local database implementation instead of Supabase
import { db as supabase } from '../utils/localDatabase';

// Export the local database with the same name for compatibility
export { supabase };
