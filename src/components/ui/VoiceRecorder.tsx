import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';
import Button from './Button';
import { useLanguage } from '../../contexts/LanguageContext';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
}

// Add TypeScript declarations for global WebkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  buttonSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  onError,
  onRecordingStateChange,
  buttonSize = 'sm',
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const { t } = useLanguage();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore errors when stopping on unmount
        }
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Reinitialize the recognition object with current language
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
          // Stop previous instance if it exists
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch {
              // Ignore errors
            }
          }
          
          const recognition = new SpeechRecognitionAPI();
          recognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = false;
          
          // Set language based on current app language
          const lang = t('content_generator.speech_recognition_lang');
          recognition.lang = lang;
          
          recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            onTranscript(transcript);
          };
          
          recognition.onerror = (event: SpeechRecognitionEvent) => {
            let errorMessage = t('content_generator.speech_recognition_error');
            
            // Provide more specific error messages for common errors
            if (event.error === 'no-speech') {
              errorMessage = t('content_generator.no_speech_detected');
            } else if (event.error === 'audio-capture') {
              errorMessage = t('content_generator.audio_capture_error');
            } else if (event.error === 'not-allowed') {
              errorMessage = t('content_generator.microphone_permission_denied');
            } else if (event.error === 'language-not-supported') {
              errorMessage = t('content_generator.language_not_supported');
              // Try falling back to English if Russian is not supported
              if (recognition.lang === 'ru-RU') {
                recognition.lang = 'en-US';
                console.log('Falling back to English for speech recognition');
                // Don't set error, just try with English
                return;
              }
            }
            
            if (onError) {
              onError(errorMessage);
            }
            setIsRecording(false);
            if (onRecordingStateChange) {
              onRecordingStateChange(false);
            }
          };
          
          recognition.onend = () => {
            setIsRecording(false);
            if (onRecordingStateChange) {
              onRecordingStateChange(false);
            }
          };
        }
      }
      
      if (!recognitionRef.current) {
        throw new Error(t('content_generator.speech_not_supported'));
      }
      
      recognitionRef.current.start();
      setIsRecording(true);
      if (onRecordingStateChange) {
        onRecordingStateChange(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.microphone_access_error');
      if (onError) {
        onError(errorMessage);
      }
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className={`flex gap-4 items-center ${className}`}>
        {isRecording && (
        <span className="text-xs text-red-500 ml-2 animate-pulse">
          {t('content_generator.recording_in_progress')}
        </span>
      )}
      <Button
        size={buttonSize}
        variant={isRecording ? "danger" : "outline"}
        onClick={isRecording ? stopRecording : startRecording}
        title={isRecording ? t('publish_panel.voice_input_active') : t('publish_panel.voice_input')}
      >
        {isRecording ? <Square size={16} /> : <Mic size={16} />}
      </Button>
      
    </div>
  );
};

export default VoiceRecorder; 