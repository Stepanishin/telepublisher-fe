import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';

const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <h1 className="text-6xl font-bold text-gray-900 mb-6">404</h1>
      <p className="text-xl text-gray-700 mb-8 text-center">
        {t('not_found.message')}
      </p>
      <Link to="/">
        <Button size="lg">{t('not_found.back_home')}</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;