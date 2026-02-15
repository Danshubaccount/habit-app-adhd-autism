import { useState, useEffect, useRef, useCallback } from 'react';

export interface MeditationAudioControls {
    isPlaying: boolean;
    isAmbientEnabled: boolean;
    voiceVolume: number;
    ambientVolume: number;
    currentTime: number;
    duration: number;
    play: (voiceUrl: string) => void;
    pause: () => void;
    restart: () => void;
    toggleAmbient: () => void;
    setVoiceVolume: (vol: number) => void;
    setAmbientVolume: (vol: number) => void;
}

export const useMeditationAudio = (ambientUrl?: string): MeditationAudioControls => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAmbientEnabled, setIsAmbientEnabled] = useState(true);
    const [voiceVolume, setVoiceVolume] = useState(1.0);
    const [ambientVolume, setAmbientVolume] = useState(0.25); // Recommended 20-30%
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
    const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
    const fadeIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        voiceAudioRef.current = new Audio();
        ambientAudioRef.current = new Audio();
        ambientAudioRef.current.loop = true;

        const voice = voiceAudioRef.current;

        const handleTimeUpdate = () => setCurrentTime(voice.currentTime);
        const handleDurationChange = () => setDuration(voice.duration);
        const handleEnded = () => setIsPlaying(false);

        voice.addEventListener('timeupdate', handleTimeUpdate);
        voice.addEventListener('durationchange', handleDurationChange);
        voice.addEventListener('ended', handleEnded);

        return () => {
            voice.removeEventListener('timeupdate', handleTimeUpdate);
            voice.removeEventListener('durationchange', handleDurationChange);
            voice.removeEventListener('ended', handleEnded);
            voice.pause();
            if (ambientAudioRef.current) ambientAudioRef.current.pause();
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (ambientAudioRef.current && ambientUrl) {
            ambientAudioRef.current.src = ambientUrl;
        }
    }, [ambientUrl]);

    const fadeInAmbient = useCallback(() => {
        if (!ambientAudioRef.current || !isAmbientEnabled) return;

        const ambient = ambientAudioRef.current;
        ambient.volume = 0;
        ambient.play().catch(e => console.error("Error playing ambient:", e));

        const step = ambientVolume / (3000 / 50); // 3 seconds, 50ms interval
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

        fadeIntervalRef.current = window.setInterval(() => {
            if (ambient.volume + step >= ambientVolume) {
                ambient.volume = ambientVolume;
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            } else {
                ambient.volume += step;
            }
        }, 50);
    }, [ambientVolume, isAmbientEnabled]);

    const fadeOutAmbient = useCallback((stopAfter = true) => {
        if (!ambientAudioRef.current) return;

        const ambient = ambientAudioRef.current;
        const step = ambient.volume / (5000 / 50); // 5 seconds, 50ms interval

        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

        fadeIntervalRef.current = window.setInterval(() => {
            if (ambient.volume - step <= 0) {
                ambient.volume = 0;
                if (stopAfter) ambient.pause();
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            } else {
                ambient.volume -= step;
            }
        }, 50);
    }, []);

    const play = useCallback((voiceUrl: string) => {
        if (!voiceAudioRef.current) return;

        if (voiceAudioRef.current.src !== voiceUrl) {
            voiceAudioRef.current.src = voiceUrl;
        }

        voiceAudioRef.current.play().then(() => {
            setIsPlaying(true);
            fadeInAmbient();
        }).catch(e => console.error("Error playing voice:", e));
    }, [fadeInAmbient]);

    const pause = useCallback(() => {
        if (voiceAudioRef.current) {
            voiceAudioRef.current.pause();
        }
        setIsPlaying(false);
        fadeOutAmbient();
    }, [fadeOutAmbient]);

    const restart = useCallback(() => {
        if (voiceAudioRef.current) {
            voiceAudioRef.current.currentTime = 0;
            if (isPlaying) {
                voiceAudioRef.current.play();
            }
        }
    }, [isPlaying]);

    const toggleAmbient = useCallback(() => {
        setIsAmbientEnabled(prev => {
            const next = !prev;
            if (isPlaying) {
                if (next) fadeInAmbient();
                else fadeOutAmbient();
            }
            return next;
        });
    }, [isPlaying, fadeInAmbient, fadeOutAmbient]);

    useEffect(() => {
        if (voiceAudioRef.current) {
            voiceAudioRef.current.volume = voiceVolume;
        }
    }, [voiceVolume]);

    useEffect(() => {
        if (ambientAudioRef.current && !fadeIntervalRef.current) {
            ambientAudioRef.current.volume = isAmbientEnabled ? ambientVolume : 0;
        }
    }, [ambientVolume, isAmbientEnabled]);

    return {
        isPlaying,
        isAmbientEnabled,
        voiceVolume,
        ambientVolume,
        currentTime,
        duration,
        play,
        pause,
        restart,
        toggleAmbient,
        setVoiceVolume,
        setAmbientVolume,
    };
};
