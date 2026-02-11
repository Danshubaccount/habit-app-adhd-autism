import type { User } from '../types';

const DB_KEY_USERS = 'antigravity_users_v1';
const DB_KEY_CURRENT_USER = 'antigravity_current_user_id';

class UserDatabase {
    // Get all users
    getUsers(): User[] {
        try {
            const data = localStorage.getItem(DB_KEY_USERS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load users', error);
            return [];
        }
    }

    // Save user
    saveUser(user: User): boolean {
        try {
            const users = this.getUsers();
            // Check if exists
            const existingIndex = users.findIndex(u => u.id === user.id);

            if (existingIndex >= 0) {
                users[existingIndex] = user;
            } else {
                users.push(user);
            }

            localStorage.setItem(DB_KEY_USERS, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Failed to save user', error);
            return false;
        }
    }

    // Find user by email
    findByEmail(email: string): User | undefined {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    }

    // Find user by ID
    findById(id: string): User | undefined {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    }

    // Set current session
    setCurrentSession(userId: string) {
        localStorage.setItem(DB_KEY_CURRENT_USER, userId);
    }

    // Get current session
    getCurrentSession(): string | null {
        return localStorage.getItem(DB_KEY_CURRENT_USER);
    }

    // Clear session
    clearSession() {
        localStorage.removeItem(DB_KEY_CURRENT_USER);
    }
}

export const db = new UserDatabase();
