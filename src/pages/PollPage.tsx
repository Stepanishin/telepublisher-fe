import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import PollPublishPanel from '../components/Dashboard/PollPublishPanel';
import TelegramPollPreview from '../components/ui/TelegramPollPreview';
import { useLanguage } from '../contexts/LanguageContext';

// Poll preview content type
interface PollPreviewContent {
  question: string;
  options: { text: string }[];
  isAnonymous: boolean;
  allowsMultipleAnswers: boolean;
}

const PollPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [pollPreviewContent, setPollPreviewContent] =
    useState<PollPreviewContent>({
      question: '',
      options: [{ text: '' }, { text: '' }],
      isAnonymous: true,
      allowsMultipleAnswers: false,
    });

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className='space-y-6'>
      {/* Header with back button */}
      <div className='flex items-center justify-between space-x-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {t('poll.title') || 'Создание опроса'}
          </h1>
          <p className='text-gray-600'>
            {t('poll.subtitle') ||
              'Создайте интерактивный опрос для вашей аудитории'}
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={handleBack}
          leftIcon={<ArrowLeft size={16} />}
        >
          {t('common.back') || 'Назад'}
        </Button>
      </div>

      {/* Main content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Left column - Poll Creation Panel */}
        <div>
          <PollPublishPanel
            onPollChange={(pollData) => setPollPreviewContent(pollData)}
          />
        </div>

        {/* Right column - Preview */}
        <div className='lg:col-span-1'>
          <TelegramPollPreview
            question={pollPreviewContent.question}
            options={pollPreviewContent.options}
            isAnonymous={pollPreviewContent.isAnonymous}
            allowsMultipleAnswers={pollPreviewContent.allowsMultipleAnswers}
          />
        </div>
      </div>
    </div>
  );
};

export default PollPage;
