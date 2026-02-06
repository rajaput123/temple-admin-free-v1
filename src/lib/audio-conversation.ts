/**
 * Audio Conversation Library
 * Handles speech-to-text and text-to-speech for multi-language support
 */

export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'ml' | 'mr' | 'gu';

const languageCodes: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
};

export class AudioConversation {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentLanguage: Language = 'en';

  constructor(language: Language = 'en') {
    this.currentLanguage = language;
    this.initializeSpeechRecognition();
    this.synthesis = window.speechSynthesis;
  }

  private initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = languageCodes[this.currentLanguage];
  }

  setLanguage(language: Language) {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = languageCodes[language];
    }
  }

  startListening(
    onResult: (text: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        const error = 'Speech recognition not available';
        onError?.(error);
        reject(new Error(error));
        return;
      }

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        resolve();
      };

      this.recognition.onerror = (event) => {
        const error = `Speech recognition error: ${event.error}`;
        onError?.(error);
        reject(new Error(error));
      };

      this.recognition.onend = () => {
        resolve();
      };

      try {
        this.recognition.start();
      } catch (error) {
        const errorMsg = 'Failed to start speech recognition';
        onError?.(errorMsg);
        reject(error);
      }
    });
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  speak(text: string, language?: Language): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCodes[language || this.currentLanguage];
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isListening(): boolean {
    return this.recognition?.state === 'listening' || false;
  }

  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
