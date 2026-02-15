import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/db';
import type { MascotState, MascotType, MascotCustomization } from '../types';

interface MascotContextType {
    mascot: MascotState | null;
    setMascot: (type: MascotType, customization: MascotCustomization, name: string) => void;
    updateMascotStreak: (increment: boolean) => void;
    triggerInteraction: (action: 'meditation' | 'breathing' | 'journal' | 'affirmation' | 'idle' | 'pet', stage: 'start' | 'complete' | 'cancel') => void;
    currentMessage: string | null;
    currentEmotion: 'happy' | 'calm' | 'proud' | 'curious' | 'neutral';
    isMinimized: boolean;
    setIsMinimized: (minimized: boolean) => void;
}

const MascotContext = createContext<MascotContextType | undefined>(undefined);

export const useMascot = () => {
    const context = useContext(MascotContext);
    if (!context) throw new Error('useMascot must be used within a MascotProvider');
    return context;
};

export const MascotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [mascot, setMascotState] = useState<MascotState | null>(currentUser?.mascot || null);
    const [currentMessage, setCurrentMessage] = useState<string | null>(null);
    const [currentEmotion, setCurrentEmotion] = useState<'happy' | 'calm' | 'proud' | 'curious' | 'neutral'>('neutral');
    const [isMinimized, setIsMinimized] = useState(false);

    // Greeting logic on load
    useEffect(() => {
        if (!mascot || currentMessage) return;

        const hour = new Date().getHours();
        let greeting = '';
        if (hour < 12) greeting = `Good morning, ${mascot.name ? mascot.name + ' says hi!' : 'ready for the day?'}`;
        else if (hour < 18) greeting = `Good afternoon! How are we doing?`;
        else greeting = `Good evening. Time to wind down soon?`;

        setCurrentMessage(greeting);
        setCurrentEmotion('calm');

        const timer = setTimeout(() => {
            setCurrentMessage(null);
            setCurrentEmotion('neutral');
        }, 8000);

        return () => clearTimeout(timer);
    }, [mascot?.type]); // Run when mascot type is loaded/changed

    // Inactivity check
    useEffect(() => {
        if (!mascot || currentMessage) return;

        const checkInactivity = () => {
            const lastInteraction = new Date(mascot.lastInteractionAt).getTime();
            const now = new Date().getTime();
            const idleHours = (now - lastInteraction) / (1000 * 60 * 60);

            if (idleHours > 24) {
                setCurrentMessage("I've missed you! Shall we do a quick breathing exercise?");
                setCurrentEmotion('curious');
            } else if (idleHours > 4 && hour > 9 && hour < 21) {
                const prompts = [
                    "How are you feeling right now?",
                    "Remember to take a deep breath.",
                    "Drink some water, friend.",
                    "I'm here if you need a moment of calm."
                ];
                setCurrentMessage(prompts[Math.floor(Math.random() * prompts.length)]);
                setCurrentEmotion('curious');
            }
        };

        const interval = setInterval(checkInactivity, 1000 * 60 * 60); // Check every hour
        const hour = new Date().getHours();

        return () => clearInterval(interval);
    }, [mascot, currentMessage]);

    const setMascot = (type: MascotType, customization: MascotCustomization, name: string) => {
        if (!currentUser) return;

        const newMascot: MascotState = {
            type,
            customization,
            name,
            lastInteractionAt: new Date().toISOString(),
            streak: 1,
        };

        const updatedUser = { ...currentUser, mascot: newMascot };
        db.saveUser(updatedUser);
        setMascotState(newMascot);

        setCurrentMessage(`Hi! I'm ${name}. Let's look after ourselves together.`);
        setCurrentEmotion('happy');
    };

    const updateMascotStreak = (increment: boolean) => {
        if (!currentUser || !mascot) return;

        const newStreak = increment ? mascot.streak + 1 : 1;
        const updatedMascot = {
            ...mascot,
            streak: newStreak,
            lastInteractionAt: new Date().toISOString()
        };

        const updatedUser = { ...currentUser, mascot: updatedMascot };
        db.saveUser(updatedUser);
        setMascotState(updatedMascot);

        if (increment) {
            if (newStreak === 3) {
                setCurrentMessage("Three days in a row! We're doing great.");
                setCurrentEmotion('proud');
            } else if (newStreak === 7) {
                setCurrentMessage("A whole week! I feel so much better when we practice.");
                setCurrentEmotion('happy');
            } else if (newStreak % 10 === 0) {
                setCurrentMessage(`${newStreak} days! You're amazing.`);
                setCurrentEmotion('happy');
            }
        }
    };

    const triggerInteraction = (action: string, stage?: 'start' | 'complete' | 'cancel') => {
        if (!mascot) return;

        const name = mascot.name || 'Friend';

        switch (action) {
            case 'pet':
                setCurrentEmotion('happy');
                const petMsgs = [
                    "That feels nice!",
                    "I love being your friend.",
                    "Hehe, thank you!",
                    "You're the best!",
                    "*wags tail*"
                ];
                setCurrentMessage(petMsgs[Math.floor(Math.random() * petMsgs.length)]);

                // Petting is an instant completion
                setTimeout(() => {
                    setCurrentMessage(null);
                    setCurrentEmotion('neutral');
                }, 4000);
                return; // Early return for pet as it has its own timer
            case 'meditation':
                if (stage === 'start') {
                    setCurrentEmotion('calm');
                    setCurrentMessage("I'm right here. Let's find some stillness.");
                } else if (stage === 'complete') {
                    setCurrentEmotion('happy');
                    const msgs = [
                        `Thank you, ${name}. I feel much calmer now.`,
                        "That was peaceful. You did so well.",
                        "I'm proud of us for taking that time."
                    ];
                    setCurrentMessage(msgs[Math.floor(Math.random() * msgs.length)]);
                } else {
                    setCurrentEmotion('neutral');
                    setCurrentMessage("Taking a break is okay too.");
                }
                break;
            case 'breathing':
                if (stage === 'start') {
                    setCurrentEmotion('calm');
                    setCurrentMessage("Breathe with me...");
                } else if (stage === 'complete') {
                    setCurrentEmotion('happy');
                    setCurrentMessage("I feel lighter. Do you?");
                }
                break;
            case 'journal':
                if (stage === 'start') {
                    setCurrentEmotion('curious');
                    setCurrentMessage(null);
                } else if (stage === 'complete') {
                    setCurrentEmotion('proud');
                    setCurrentMessage(`Sharing your thoughts is a big step, ${name}.`);
                }
                break;
            case 'affirmation':
                if (stage === 'complete') {
                    setCurrentEmotion('happy');
                    setCurrentMessage("I believe in us! Let's carry that feeling with us.");
                }
                break;
            default:
                setCurrentEmotion('neutral');
                setCurrentMessage(null);
        }

        // Auto-clear message after 6 seconds if it's a completion message
        if (stage === 'complete' || stage === 'cancel') {
            setTimeout(() => {
                setCurrentMessage(null);
                setCurrentEmotion('neutral');
            }, 6000);
        }
    };

    return (
        <MascotContext.Provider value={{
            mascot,
            setMascot,
            updateMascotStreak,
            triggerInteraction,
            currentMessage,
            currentEmotion,
            isMinimized,
            setIsMinimized
        }}>
            {children}
        </MascotContext.Provider>
    );
};
