import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { db } from '../services/db';

interface AuthContextType {
    currentUser: User | null;
    login: (email: string, pass: string) => Promise<boolean>;
    signup: (email: string, pass: string, name: string, age: number) => Promise<boolean>;
    logout: () => void;
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

    // Load session on mount
    useEffect(() => {
        const initAuth = () => {
            const userId = db.getCurrentSession();
            if (userId) {
                const user = db.findById(userId);
                if (user) {
                    setCurrentUser(user);
                } else {
                    // Stale session
                    db.clearSession();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, pass: string) => {
        const user = db.findByEmail(email);
        if (user && user.password === pass) {
            db.setCurrentSession(user.id);
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const signup = async (email: string, pass: string, name: string, age: number) => {
        if (db.findByEmail(email)) {
            return false; // Email exists
        }

        const newUser: User = {
            id: crypto.randomUUID(),
            email,
            password: pass,
            name,
            age,
            createdAt: new Date().toISOString()
        };

        const success = db.saveUser(newUser);
        if (success) {
            db.setCurrentSession(newUser.id);
            setCurrentUser(newUser);
            return true;
        }
        return false;
    };

    const logout = () => {
        db.clearSession();
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
