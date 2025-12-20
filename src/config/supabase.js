// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables!');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get current user
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
}

// Helper function to get user role
export async function getUserRole() {
    const user = await getCurrentUser();
    if (!user) return 'anonymous';
    
    const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
    
    if (error) {
        console.error('Error getting user role:', error);
        return 'public'; // Default to public if no role found
    }
    
    return data?.role || 'public';
}

// Helper function to check if user is admin
export async function isAdmin() {
    const role = await getUserRole();
    return role === 'admin';
}
