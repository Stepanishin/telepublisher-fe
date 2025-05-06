import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Globe } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage, Language } from '../../contexts/LanguageContext';

// Add translations for PublicNavbar
const translations: Record<Language, Record<string, string>> = {
  en: {
    'navbar.features': 'Features',
    'navbar.pricing': 'Pricing',
    'navbar.login': 'Login'
  },
  ru: {
    'navbar.features': 'Возможности',
    'navbar.pricing': 'Тарифы',
    'navbar.login': 'Войти'
  }
};

const PublicNavbar: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  
  // Toggle language between English and Russian
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };
  
  // Get translation based on current language
  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  return (
    <nav className="bg-transparent absolute top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Send className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-semibold text-white">
                TelePublisher
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* Language toggle button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center px-2 py-1 bg-blue-700 bg-opacity-30 rounded-md text-sm hover:bg-opacity-50 transition-colors"
            >
              <Globe className="h-4 w-4 text-white mr-1" />
              <span className="font-medium text-white">{language === 'en' ? 'EN' : 'RU'}</span>
            </button>
            
            <a href="#features" className="text-white hover:text-blue-100">
              {t('navbar.features')}
            </a>
            <a href="#pricing" className="text-white hover:text-blue-100">
              {t('navbar.pricing')}
            </a>
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-blue-700">
                {t('navbar.login')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar; 