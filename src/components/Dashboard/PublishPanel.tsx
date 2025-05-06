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
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { t } = useLanguage();
  
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
      setFormError(t('publish_panel.no_channel_error'));
      return;
    }
    
    if (!publishText && !publishImageUrl) {
      setFormError(t('publish_panel.no_content_error'));
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
        <CardTitle>{t('publish_panel.title')}</CardTitle>
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
          label={t('publish_panel.select_channel')}
          options={channelOptions}
          value={selectedChannelId}
          onChange={handleChannelChange}
          error={formError && !selectedChannelId ? t('publish_panel.select_channel_error') : ''}
        />
        
        <TextArea
          label={t('publish_panel.text_label')}
          placeholder={t('publish_panel.text_placeholder')}
          value={publishText}
          onChange={(e) => setPublishText(e.target.value)}
          rows={4}
        />
        
        <Input
          label={t('publish_panel.image_url')}
          placeholder={t('publish_panel.image_url_placeholder')}
          value={publishImageUrl}
          onChange={(e) => setPublishImageUrl(e.target.value)}
          fullWidth
        />
        
        <TagInput
          label={t('publish_panel.tags')}
          tags={publishTags}
          onChange={setPublishTags}
        />
        
        {publishImageUrl && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('publish_panel.image_preview')}
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
          {t('publish_panel.publish_button')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PublishPanel;