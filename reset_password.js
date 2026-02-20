import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qrksvfmtqrgbhkpgrhee.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya3N2Zm10cXJnYmhrcGdyaGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDcwMzksImV4cCI6MjA4NzE4MzAzOX0.oIUSbGLHk1zSodBaZpkekf_3_098LHkUcvGEGoEjg9U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPassword() {
    const { data, error } = await supabase.auth.resetPasswordForEmail('dan.cotter93@gmail.com', {
        redirectTo: 'http://localhost:5173/reset-password', // Update if necessary
    });

    if (error) {
        console.error('Error resetting password:', error.message);
    } else {
        console.log('Password reset email sent to dan.cotter93@gmail.com', data);
    }
}

resetPassword();
