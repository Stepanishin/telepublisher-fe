import React, { useState } from 'react';
import { Sparkles, ImageIcon, Hash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useContentStore } from '../../store/contentStore';

const ContentGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const { 
    content, 
    isGenerating, 
    generateText, 
    generateImage, 
    generateTags 
  } = useContentStore();

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleGenerateText = async () => {
    if (!prompt.trim()) return;
    await generateText(prompt);
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    await generateImage(prompt);
  };

  const handleGenerateTags = async () => {
    if (!content.text.trim()) {
      // If no text is generated yet, generate tags based on prompt
      if (!prompt.trim()) return;
      await generateTags(prompt);
    } else {
      // Otherwise, generate tags based on generated text
      await generateTags(content.text);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Генератор контента</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          label="Введите промпт"
          placeholder="О чем сгенерировать контент?"
          value={prompt}
          onChange={handlePromptChange}
          fullWidth
        />
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            leftIcon={<Sparkles size={16} />}
            onClick={handleGenerateText}
            isLoading={isGenerating}
            disabled={!prompt.trim() || isGenerating}
          >
            Сгенерировать текст
          </Button>
          
          <Button
            variant="secondary"
            leftIcon={<ImageIcon size={16} />}
            onClick={handleGenerateImage}
            isLoading={isGenerating}
            disabled={!prompt.trim() || isGenerating}
          >
            Сгенерировать изображение
          </Button>
          
          <Button
            variant="outline"
            leftIcon={<Hash size={16} />}
            onClick={handleGenerateTags}
            isLoading={isGenerating}
            disabled={(!prompt.trim() && !content.text.trim()) || isGenerating}
          >
            Сгенерировать теги
          </Button>
        </div>
      </CardContent>
      
      {(content.text || content.imageUrl || content.tags.length > 0) && (
        <CardFooter className="flex flex-col items-start">
          <h4 className="text-md font-medium mb-2">Результат генерации:</h4>
          
          {/* Preview content */}
          <div className="w-full space-y-4">
            {content.text && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Текст:</h5>
                <p className="text-sm whitespace-pre-line">{content.text}</p>
              </div>
            )}
            
            {content.imageUrl && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Изображение:</h5>
                <div className="relative w-full h-48 overflow-hidden rounded">
                  <img 
                    src={content.imageUrl} 
                    alt="Generated content" 
                    className="max-h-48 mx-auto object-contain rounded"
                  />
                </div>
              </div>
            )}
            
            {content.tags.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Теги:</h5>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag, index) => (
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