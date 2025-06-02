import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import DraftsPanel from '../components/Dashboard/DraftsPanel';
import { useLanguage } from '../contexts/LanguageContext';

const DraftsPage: React.FC = () => {
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
            {t('drafts.title') || 'Черновики'}
          </h1>
          <p className='text-gray-600'>
            {t('drafts.subtitle') ||
              'Управляйте сохраненными черновиками ваших постов'}
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
      <DraftsPanel />
    </div>
  );
};

export default DraftsPage;
