import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import AutoPostingPanel from '../components/Dashboard/AutoPostingPanel';
import { useLanguage } from '../contexts/LanguageContext';

const AutoPostingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className='space-y-6'>
      {/* Header with back button */}
      <div className='flex items-center justify-between space-x-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {t('auto_posting.title') || 'Автопостинг'}
          </h1>
          <p className='text-gray-600'>
            {t('auto_posting.subtitle') ||
              'Настройте автоматическую публикацию контента в ваших каналах'}
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
      <AutoPostingPanel />
    </div>
  );
};

export default AutoPostingPage;
