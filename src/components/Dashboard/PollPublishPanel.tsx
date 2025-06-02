import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PlusCircle, Trash2, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useLanguage } from '../../contexts/LanguageContext';
import { useChannelsStore } from '../../store/channelsStore';
import { useNotification } from '../../contexts/NotificationContext';
import { publishPoll } from '../../services/api';

interface PollOption {
  text: string;
}

interface PollData {
  question: string;
  options: PollOption[];
  isAnonymous: boolean;
  allowsMultipleAnswers: boolean;
}

interface PollPublishPanelProps {
  onPollChange?: (pollData: PollData) => void;
}

const PollPublishPanel: React.FC<PollPublishPanelProps> = ({ onPollChange }) => {
  const { t } = useLanguage();
  const { channels } = useChannelsStore();
  const { setNotification } = useNotification();
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { text: '' },
    { text: '' }
  ]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [allowsMultipleAnswers, setAllowsMultipleAnswers] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Notify parent about poll changes
  useEffect(() => {
    if (onPollChange) {
      onPollChange({
        question,
        options,
        isAnonymous,
        allowsMultipleAnswers
      });
    }
  }, [question, options, isAnonymous, allowsMultipleAnswers, onPollChange]);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { text: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleChannelChange = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const validatePoll = (): string | null => {
    if (!question.trim()) {
      return t('poll_publish.question_required') || 'Вопрос опроса обязателен';
    }

    const validOptions = options.filter(option => option.text.trim());
    if (validOptions.length < 2) {
      return t('poll_publish.min_two_options') || 'Опрос должен содержать минимум 2 варианта ответа';
    }

    if (selectedChannels.length === 0) {
      return 'Выберите хотя бы один канал для публикации';
    }

    return null;
  };

  const handlePublish = async () => {
    const error = validatePoll();
    if (error) {
      setNotification({
        type: 'error',
        message: error
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      const validOptions = options.filter(option => option.text.trim());
      
      for (const channelId of selectedChannels) {
        const channel = channels.find(c => c._id === channelId);
        if (!channel) continue;

        await publishPoll({
          channelId,
          question: question.trim(),
          options: validOptions,
          isAnonymous,
          allowsMultipleAnswers
        });
      }

      setNotification({
        type: 'success',
        message: selectedChannels.length === 1 
          ? 'Опрос успешно опубликован!'
          : `Опрос успешно опубликован в ${selectedChannels.length} каналах!`
      });

      // Clear form
      setQuestion('');
      setOptions([{ text: '' }, { text: '' }]);
      setSelectedChannels([]);
      
    } catch (error) {
      console.error('Failed to publish poll:', error);
      setNotification({
        type: 'error',
        message: 'Ошибка при публикации опроса'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('poll_publish.title') || 'Создание опроса'}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('poll_publish.question_label') || 'Вопрос опроса'} *
          </label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('poll_publish.question_placeholder') || 'Введите вопрос опроса'}
            className="w-full"
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('poll_publish.options_label') || 'Варианты ответов'} *
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`${t('poll_publish.option_placeholder') || 'Вариант'} ${index + 1}`}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {options.length < 10 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              leftIcon={<PlusCircle size={16} />}
              className="mt-2"
            >
              {t('poll_publish.add_option') || 'Добавить вариант'}
            </Button>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            {t('poll_publish.options_help') || 'Минимум 2, максимум 10 вариантов'}
          </p>
        </div>

        {/* Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('poll_publish.settings_label') || 'Настройки опроса'}
          </label>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="anonymous" className="text-sm">
                {t('poll_publish.anonymous_label') || 'Анонимное голосование'}
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="multiple"
                checked={allowsMultipleAnswers}
                onChange={(e) => setAllowsMultipleAnswers(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="multiple" className="text-sm">
                {t('poll_publish.multiple_label') || 'Разрешить несколько ответов'}
              </label>
            </div>
          </div>
        </div>

        {/* Channel Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('poll_publish.channels_label') || 'Выберите каналы для публикации'} *
          </label>
          
          {channels.length === 0 ? (
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                {t('poll_publish.no_channels_message') || 'Нет подключенных каналов. Добавьте каналы в разделе "Управление каналами".'}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {channels.map(channel => (
                <div key={channel._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`channel-${channel._id}`}
                    checked={selectedChannels.includes(channel._id!)}
                    onChange={() => handleChannelChange(channel._id!)}
                    className="mr-2"
                  />
                  <label htmlFor={`channel-${channel._id}`} className="text-sm">
                    {channel.username}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publish Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handlePublish}
            isLoading={isPublishing}
            disabled={channels.length === 0}
            className="w-full"
          >
            {isPublishing ? t('poll.publicing') || 'Публикация...' : t('poll.publish') || 'Опубликовать опрос'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollPublishPanel; 