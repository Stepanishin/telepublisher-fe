import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import TextArea from '../ui/TextArea';
import Input from '../ui/Input';
import Select from '../ui/Select';
import TagInput from '../ui/TagInput';
import Alert from '../ui/Alert';
import { useChannelsStore } from '../../store/channelsStore';
import { useContentStore } from '../../store/contentStore';

const PublishPanel: React.FC = () => {
  const { channels } = useChannelsStore();
  const { 
    content, 
    isPublishing, 
    publishResult, 
    error, 
    publish, 
    resetPublishResult
  } = useContentStore();
  
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [publishText, setPublishText] = useState('');
  const [publishImageUrl, setPublishImageUrl] = useState('');
  const [publishTags, setPublishTags] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  
  // Update form values when content changes
  useEffect(() => {
    setPublishText(content.text);
    setPublishImageUrl(content.imageUrl);
    setPublishTags(content.tags);
  }, [content]);
  
  // Reset alert after 5 seconds
  useEffect(() => {
    if (publishResult) {
      const timer = setTimeout(() => {
        resetPublishResult();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [publishResult, resetPublishResult]);
  
  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('handleChannelChange', e.target.value);
    setSelectedChannelId(e.target.value);
    setFormError('');
  };
  
  const handlePublish = async () => {
    // Validate form
    if (!selectedChannelId) {
      setFormError('Выберите канал для публикации');
      return;
    }
    
    if (!publishText && !publishImageUrl) {
      setFormError('Добавьте текст или изображение для публикации');
      return;
    }
    console.log('Publishing to channel ID:', selectedChannelId);
    // Submit
    await publish({
      channelId: selectedChannelId,
      text: publishText,
      imageUrl: publishImageUrl,
      tags: publishTags
    });
  };
  
  // Create properly formatted channel options
  const channelOptions = channels.map(channel => {
    // Handle both _id and id formats
    const channelId = channel._id || channel.id;
    return {
      value: channelId,
      label: `${channel.title} (${channel.username})`
    };
  });  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Панель публикации</CardTitle>
      </CardHeader>
      <CardContent>
        {publishResult && (
          <Alert
            variant={publishResult.success ? 'success' : 'error'}
            message={publishResult.message}
            onClose={resetPublishResult}
          />
        )}
        
        {error && (
          <Alert
            variant="error"
            message={error}
          />
        )}
        
        {formError && (
          <Alert
            variant="warning"
            message={formError}
            onClose={() => setFormError('')}
          />
        )}
        
        <Select
          label="Выберите канал"
          options={channelOptions}
          value={selectedChannelId}
          onChange={handleChannelChange}
          error={formError && !selectedChannelId ? 'Выберите канал' : ''}
        />
        
        <TextArea
          label="Текст публикации"
          placeholder="Введите текст публикации..."
          value={publishText}
          onChange={(e) => setPublishText(e.target.value)}
          rows={4}
        />
        
        <Input
          label="URL изображения"
          placeholder="https://example.com/image.jpg"
          value={publishImageUrl}
          onChange={(e) => setPublishImageUrl(e.target.value)}
          fullWidth
        />
        
        <TagInput
          label="Теги"
          tags={publishTags}
          onChange={setPublishTags}
        />
        
        {publishImageUrl && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Предпросмотр изображения
            </label>
            <div className="border border-gray-300 rounded-md p-2">
              <img 
                src={publishImageUrl} 
                alt="Preview" 
                className="max-h-48 mx-auto object-contain rounded" 
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          fullWidth
          onClick={handlePublish}
          isLoading={isPublishing}
          disabled={isPublishing || (!publishText && !publishImageUrl)}
          leftIcon={<Send size={16} />}
        >
          Опубликовать
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PublishPanel;