import React, { useState } from 'react';
import { Sparkles, ImageIcon, Hash, ArrowRight, Upload, Wand2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useContentStore } from '../../store/contentStore';
import { useCreditStore } from '../../store/creditStore';
import Alert from '../ui/Alert';
import { useLanguage } from '../../contexts/LanguageContext';
import ImageUploader from '../ui/ImageUploader';

const ContentGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>('');
  const [mode, setMode] = useState<'text' | 'image' | 'fromImage'>('text');
  
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

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.error_text');
      setError(errorMessage);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.error_image');
      setError(errorMessage);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.error_text_from_image');
      setError(errorMessage);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.error_image_from_image');
      setError(errorMessage);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('content_generator.error_tags');
      setError(errorMessage);
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
        <CardTitle>{t('content_generator.title')}</CardTitle>
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
          <Input
            label={mode === 'fromImage' ? t('content_generator.additional_instructions') : t('content_generator.prompt_label')}
            placeholder={mode === 'fromImage' ? t('content_generator.describe_based_on_image') : t('content_generator.prompt_placeholder')}
            value={prompt}
            onChange={handlePromptChange}
            fullWidth
          />
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