import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ImageIcon, Hash, ArrowRight, Upload, Wand2, Mic, Square } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import { useContentStore } from '../../store/contentStore';
import { useCreditStore } from '../../store/creditStore';
import Alert from '../ui/Alert';
import { useLanguage } from '../../contexts/LanguageContext';
import ImageUploader from '../ui/ImageUploader';
import { useNotification } from '../../contexts/NotificationContext';

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

const ContentGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>('');
  const [mode, setMode] = useState<'text' | 'image' | 'fromImage'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  
  const { 
    generatedContent, 
    isGenerating, 
    generateText, 
    generateImage, 
    generateTags,
    generateTextFromImage,
    generateImageFromImage,
    transferGeneratedText,
    transferGeneratedImage,
    transferGeneratedTags
  } = useContentStore();
  const { creditInfo, fetchCreditInfo } = useCreditStore();
  const { t } = useLanguage();
  const { setNotification } = useNotification();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (error) setError('');
  };

  const handleGenerateText = async () => {
    if (!prompt.trim()) return;
    try {
      setError('');
      setSuccessMessage(null);
      await generateText(prompt);
      // Refresh credits after successful generation
      fetchCreditInfo();
      setNotification({
        type: 'success',
        message: 'Контент успешно сгенерирован!'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.error_text');
      setError(errorMessage);
      setNotification({
        type: 'error',
        message: 'Ошибка при генерации контента'
      });
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    try {
      setError('');
      setSuccessMessage(null);
      await generateImage(prompt);
      // Refresh credits after successful generation
      fetchCreditInfo();
      setNotification({
        type: 'success',
        message: 'Изображение успешно сгенерировано!'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.error_image');
      setError(errorMessage);
      setNotification({
        type: 'error',
        message: 'Ошибка при генерации изображения'
      });
    }
  };

  const handleGenerateTextFromImage = async () => {
    if (!referenceImageUrl) {
      setError('Необходимо загрузить изображение');
      return;
    }

    try {
      setError('');
      setSuccessMessage(null);
      await generateTextFromImage(referenceImageUrl, prompt);
      // Refresh credits after successful generation
      fetchCreditInfo();
      setNotification({
        type: 'success',
        message: 'Текст успешно сгенерирован!'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.error_text_from_image');
      setError(errorMessage);
      setNotification({
        type: 'error',
        message: 'Ошибка при генерации текста из изображения'
      });
    }
  };

  const handleGenerateImageFromImage = async () => {
    if (!referenceImageUrl) {
      setError('Необходимо загрузить изображение');
      return;
    }

    try {
      setError('');
      setSuccessMessage(null);
      await generateImageFromImage(referenceImageUrl, prompt);
      // Refresh credits after successful generation
      fetchCreditInfo();
      setNotification({
        type: 'success',
        message: 'Изображение успешно сгенерировано!'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.error_image_from_image');
      setError(errorMessage);
      setNotification({
        type: 'error',
        message: 'Ошибка при генерации изображения из изображения'
      });
    }
  };

  const handleGenerateTags = async () => {
    try {
      setError('');
      setSuccessMessage(null);
      if (!generatedContent.text.trim()) {
        // If no text is generated yet, generate tags based on prompt
        if (!prompt.trim()) return;
        await generateTags(prompt);
      } else {
        // Otherwise, generate tags based on generated text
        await generateTags(generatedContent.text);
      }
      // Refresh credits after successful generation
      fetchCreditInfo();
      setNotification({
        type: 'success',
        message: 'Теги успешно сгенерированы!'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.error_tags');
      setError(errorMessage);
      setNotification({
        type: 'error',
        message: 'Ошибка при генерации тегов'
      });
    }
  };

  // Initialize speech recognition
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

  // Voice recording functions
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
            setPrompt(prev => prev + (prev ? ' ' : '') + transcript);
          };
          
          recognition.onerror = (event: SpeechRecognitionEvent) => {
            console.error('Speech recognition error:', event.error);
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
            
            setError(errorMessage);
            setIsRecording(false);
          };
          
          recognition.onend = () => {
            setIsRecording(false);
            setSuccessMessage(null);
          };
        }
      }
      
      if (!recognitionRef.current) {
        throw new Error(t('content_generator.speech_not_supported'));
      }
      
      recognitionRef.current.start();
      setIsRecording(true);
      // setSuccessMessage(t('content_generator.recording'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.microphone_access_error');
      setError(errorMessage);
      setNotification({
        type: 'error',
        message: 'Ошибка доступа к микрофону'
      });
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      // setSuccessMessage(t('content_generator.recording_stopped'));
    }
  };

  // Function to display success message temporarily
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleModeChange = (newMode: 'text' | 'image' | 'fromImage') => {
    setMode(newMode);
    setError('');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
          {t('content_generator.title') || 'AI Генератор контента'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert
            variant="error"
            message={error}
            onClose={() => setError('')}
          />
        )}
        
        {successMessage && (
          <Alert
            variant="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}
        
        {/* Mode selection tabs */}
        <div className="flex space-x-2 mb-4 border-b border-gray-200">
          <button 
            className={`px-4 py-2 ${mode === 'text' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => handleModeChange('text')}
          >
            <Sparkles size={16} className="inline mr-1" />
            {t('content_generator.standard_mode')}
          </button>
          <button 
            className={`px-4 py-2 ${mode === 'fromImage' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => handleModeChange('fromImage')}
          >
            <Upload size={16} className="inline mr-1" />
            {t('content_generator.image_based_mode')}
          </button>
        </div>
        
        {mode === 'fromImage' && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">{t('content_generator.upload_image_prompt')}</h4>
            <ImageUploader
              value={referenceImageUrl}
              onChange={setReferenceImageUrl}
              onError={setError}
            />
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">{t('content_generator.supported_formats')}</span> JPG, JPEG, PNG. 
              <span className="font-semibold ml-1">{t('content_generator.max_file_size')}</span> 4MB.
              <br />
              {t('content_generator.conversion_note')}
            </p>
          </div>
        )}
        
        <div className="mt-4">
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <TextArea
                label={mode === 'fromImage' ? t('content_generator.additional_instructions') : t('content_generator.prompt_label')}
                placeholder={mode === 'fromImage' ? t('content_generator.describe_based_on_image') : t('content_generator.prompt_placeholder')}
                value={prompt}
                onChange={handlePromptChange}
                rows={3}
                className="w-full"
              />
            </div>
            <Button
              size="sm"
              variant={isRecording ? "danger" : "outline"}
              className="mb-4 h-[38px]"
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? t('content_generator.stop_recording') : t('content_generator.start_recording')}
            >
              {isRecording ? <Square size={16} /> : <Mic size={16} />}
            </Button>
          </div>
          {isRecording && (
            <p className="text-xs text-red-500 mt-1 animate-pulse">
              {t('content_generator.recording_in_progress')}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {mode === 'text' && (
            <>
              <Button
                leftIcon={<Sparkles size={16} />}
                onClick={handleGenerateText}
                isLoading={isGenerating}
                disabled={!prompt.trim() || isGenerating}
              >
                {t('content_generator.generate_text')}
                {creditInfo && <span className="ml-1 text-xs opacity-70">(1 {t('content_generator.credits')})</span>}
              </Button>
              
              <Button
                variant="secondary"
                leftIcon={<ImageIcon size={16} />}
                onClick={handleGenerateImage}
                isLoading={isGenerating}
                disabled={!prompt.trim() || isGenerating}
              >
                {t('content_generator.generate_image')}
                {creditInfo && <span className="ml-1 text-xs opacity-70">(2 {t('content_generator.credits_plural')})</span>}
              </Button>
            </>
          )}
          
          {mode === 'fromImage' && (
            <>
              <Button
                leftIcon={<Sparkles size={16} />}
                onClick={handleGenerateTextFromImage}
                isLoading={isGenerating}
                disabled={!referenceImageUrl || isGenerating}
              >
                {t('content_generator.generate_text_from_image')}
                <span className="ml-1 text-xs opacity-70">(2 {t('content_generator.credits_visionapi')})</span>
              </Button>
              
              <Button
                variant="secondary"
                leftIcon={<Wand2 size={16} />}
                onClick={handleGenerateImageFromImage}
                isLoading={isGenerating}
                disabled={!referenceImageUrl || isGenerating}
              >
                {t('content_generator.generate_image_from_image')}
                <span className="ml-1 text-xs opacity-70">(3 {t('content_generator.credits_imageedit')})</span>
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            leftIcon={<Hash size={16} />}
            onClick={handleGenerateTags}
            isLoading={isGenerating}
            disabled={(!prompt.trim() && !generatedContent.text.trim() && !referenceImageUrl) || isGenerating}
          >
            {t('content_generator.generate_tags')}
            {creditInfo && <span className="ml-1 text-xs opacity-70">(1 {t('content_generator.credits')})</span>}
          </Button>
        </div>
      </CardContent>
      
      {(generatedContent.text || generatedContent.imageUrl || generatedContent.tags.length > 0) && (
        <CardFooter className="flex flex-col items-start">
          <h4 className="text-md font-medium mb-2">{t('content_generator.generation_results')}</h4>
          
          {/* Preview content */}
          <div className="w-full space-y-4">
            {generatedContent.text && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-sm font-medium text-gray-700">{t('content_generator.text')}</h5>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowRight size={14} />}
                    onClick={() => {
                      transferGeneratedText();
                      showSuccessMessage(t('content_generator.text_copied'));
                    }}
                  >
                    {t('content_generator.use_text')}
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-line">{generatedContent.text}</p>
              </div>
            )}
            
            {generatedContent.imageUrl && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-sm font-medium text-gray-700">{t('content_generator.image')}</h5>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowRight size={14} />}
                    onClick={() => {
                      transferGeneratedImage();
                      showSuccessMessage(t('content_generator.image_copied'));
                    }}
                  >
                    {t('content_generator.use_image')}
                  </Button>
                </div>
                <div className="relative w-full h-48 overflow-hidden rounded">
                  <img 
                    src={generatedContent.imageUrl} 
                    alt="Generated content" 
                    className="max-h-48 mx-auto object-contain rounded"
                  />
                </div>
              </div>
            )}
            
            {generatedContent.tags.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-sm font-medium text-gray-700">{t('content_generator.tags')}</h5>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<ArrowRight size={14} />}
                    onClick={() => {
                      transferGeneratedTags();
                      showSuccessMessage(t('content_generator.tags_copied'));
                    }}
                  >
                    {t('content_generator.use_tags')}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generatedContent.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ContentGenerator;