import * as Speech from 'expo-speech';
import { translateText } from './translate';
import { t } from './i18n';

// Map our language codes to standard BCP-47 tags
const LangMap: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
};

export const AudioEngine = {
  play: async (text: string, langCode: string = 'en') => {
    try {
      // Stop anything currently playing
      await Speech.stop();

      const language = LangMap[langCode] || 'en-IN';
      
      let finalText = text;
      
      if (langCode !== 'en') {
        const staticTransl = t(text as any, langCode);
        if (staticTransl !== text) {
          finalText = staticTransl;
        } else {
          finalText = await translateText(text, langCode);
        }
      }

      Speech.speak(finalText, {
        pitch: 1.0,
        rate: 0.9, // Slightly slower for clarity
        onError: (err) => console.log('Speech error:', err),
      });
    } catch (e) {
      console.log('Failed to play audio:', e);
    }
  },

  stop: async () => {
    try {
      await Speech.stop();
    } catch (e) {
      // ignore
    }
  }
};
