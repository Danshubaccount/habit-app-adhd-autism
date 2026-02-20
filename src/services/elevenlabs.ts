/**
 * Service for interacting with ElevenLabs API.
 * Uses plain text (no SSML) for maximum stability and quality.
 */

const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY || '';
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - warm, calm, proven stable
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

export interface ElevenLabsOptions {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
    speed?: number;
}

const DEFAULT_OPTIONS: ElevenLabsOptions = {
    stability: 1.0, // eleven_v3 requires exactly 0.0 (Creative), 0.5 (Natural), or 1.0 (Robust)
    similarity_boost: 0.70,
    style: 0.0,
    use_speaker_boost: true,
    speed: 0.7,
};

export class ElevenLabsService {
    /**
     * Preprocesses text: converts [PAUSE_X] markers to natural ellipsis pauses.
     * No SSML — plain text is far more stable across all ElevenLabs voices.
     */
    static preprocessText(text: string): string {
        // Convert [PAUSE_X] to repeated ellipses on new lines.
        // Each "..." on its own line creates a ~1-2 second natural pause.
        const processed = text.replace(/\[PAUSE_(\d+)\]/g, (_, seconds) => {
            const count = Math.min(parseInt(seconds), 8);
            // Use line breaks + ellipses for natural silence
            return '\n' + '...\n'.repeat(count);
        });

        return processed;
    }

    /**
     * Generates audio from text using ElevenLabs.
     * Sends plain text (NOT SSML) for maximum voice quality.
     */
    static async textToSpeech(text: string, options: Partial<ElevenLabsOptions> = {}): Promise<string> {
        if (!ELEVEN_LABS_API_KEY) {
            console.warn('ElevenLabs API Key is missing.');
            return this.simulateAudio();
        }

        const fullOptions = { ...DEFAULT_OPTIONS, ...options };
        const processedText = this.preprocessText(text);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVEN_LABS_API_KEY,
                },
                body: JSON.stringify({
                    text: processedText,
                    model_id: 'eleven_v3',
                    voice_settings: fullOptions,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('ElevenLabs API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                });
                throw new Error(`ElevenLabs API error: ${response.statusText} - ${errorData.detail?.message || JSON.stringify(errorData)}`);
            }

            const audioBlob = await response.blob();
            return URL.createObjectURL(audioBlob);
        } catch (error) {
            console.error('Failed to generate audio:', error);
            throw error;
        }
    }

    /**
     * Simulates audio generation for testing without API key.
     */
    private static simulateAudio(): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(''), 500);
        });
    }

    /**
     * Prepare the full meditation script with intro and outro.
     * Uses generous pauses via ellipses for a slow, meditative pace.
     */
    static prepareFullScript(dynamicText: string): string {
        const intro = `Welcome.
...
...
...
...
...
Take a moment to simply be.
...
...
...
...
...
Release any expectations... and just notice.
...
...
...
...
...
...
...
...
Let us begin.
...
...
...
...
...`;

        const outro = `...
...
...
...
...
...
...
...
Gently returning to the space around you.
...
...
...
...
...
Peace.`;

        return `${intro}\n${dynamicText}\n${outro}`;
    }
}
