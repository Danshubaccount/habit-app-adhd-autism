/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    currentUser: User | null;
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    signup: (email: string, pass: string, name: string, age: number) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user profile data from public.profiles table
    const fetchProfile = async (userId: string, email: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            // Fallback user object
            return {
                id: userId,
                email: email,
                name: 'User',
                age: 0,
                createdAt: new Date().toISOString()
            };
        }

        return {
            id: data.id,
            email: data.email,
            name: data.name || 'User',
            age: data.age || 0,
            createdAt: data.created_at
        };
    };

    // Load session on mount
    useEffect(() => {
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const profile = await fetchProfile(session.user.id, session.user.email || '');
                setCurrentUser(profile);
            }
            setIsLoading(false);
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.id, session.user.email || '');
                setCurrentUser(profile);
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password: pass
            });
            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        }
    };

    const signup = async (email: string, pass: string, name: string, age: number) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password: pass,
                options: {
                    data: {
                        full_name: name,
                        age: age
                    }
                }
            });
            if (error) throw error;

            console.log("Signup returned data:", data);

            // Supabase trigger will handle adding the user to `profiles`.
            // The session might be automatically initiated via `onAuthStateChange`.
            return { success: true };
        } catch (error: any) {
            console.error('Signup failed:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, signup, logout, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
