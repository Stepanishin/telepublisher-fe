import React from 'react';
import { Send, Mail, MessageCircle, Youtube, MapPin, Building, Briefcase } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import PublicNavbar from '../components/Layout/PublicNavbar';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

// Define the translation type
type TranslationKeys = 
  | 'contact.title' | 'contact.subtitle' | 'contact.description'
  | 'contact.company_info' | 'contact.company_name' | 'contact.company_address'
  | 'contact.founded' | 'contact.mission' | 'contact.contact_methods'
  | 'contact.email' | 'contact.email_address' | 'contact.telegram'
  | 'contact.telegram_handle' | 'contact.telegram_btn' | 'contact.youtube'
  | 'contact.youtube_channel' | 'contact.youtube_btn' | 'contact.working_hours'
  | 'contact.hours_description' | 'contact.weekend' | 'contact.response_time';

// Add translations for Contact page
const translations: Record<Language, Record<TranslationKeys, string>> = {
  en: {
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We\'d love to hear from you',
    'contact.description': 'Have questions about our service or need help with your account? Our team is ready to assist you.',
    'contact.company_info': 'Company Information',
    'contact.company_name': 'TelePublisher Inc.',
    'contact.company_address': '123 Tech Street, Digital City, 10011',
    'contact.founded': 'Founded in 2023',
    'contact.mission': 'Our mission is to simplify content creation and publishing for Telegram channel owners.',
    'contact.contact_methods': 'Contact Methods',
    'contact.email': 'Email',
    'contact.email_address': 'support@telepublisher.com',
    'contact.telegram': 'Telegram',
    'contact.telegram_handle': '@telepublisher_support',
    'contact.telegram_btn': 'Contact on Telegram',
    'contact.youtube': 'YouTube',
    'contact.youtube_channel': 'TelePublisher Tutorials',
    'contact.youtube_btn': 'Watch our channel',
    'contact.working_hours': 'Working Hours',
    'contact.hours_description': 'Monday to Friday: 9:00 AM - 6:00 PM (GMT)',
    'contact.weekend': 'Weekend support available for business subscriptions',
    'contact.response_time': 'We typically respond within 24 hours',
  },
  ru: {
    'contact.title': 'Свяжитесь с нами',
    'contact.subtitle': 'Мы будем рады услышать вас',
    'contact.description': 'Есть вопросы о нашем сервисе или нужна помощь с аккаунтом? Наша команда готова помочь вам.',
    'contact.company_info': 'Информация о компании',
    'contact.company_name': 'TelePublisher Inc.',
    'contact.company_address': 'ул. Технологическая 123, Цифровой Город, 10011',
    'contact.founded': 'Основана в 2023 году',
    'contact.mission': 'Наша миссия - упростить создание и публикацию контента для владельцев Telegram-каналов.',
    'contact.contact_methods': 'Способы связи',
    'contact.email': 'Электронная почта',
    'contact.email_address': 'support@telepublisher.com',
    'contact.telegram': 'Telegram',
    'contact.telegram_handle': '@telepublisher_support',
    'contact.telegram_btn': 'Связаться в Telegram',
    'contact.youtube': 'YouTube',
    'contact.youtube_channel': 'TelePublisher Уроки',
    'contact.youtube_btn': 'Смотреть наш канал',
    'contact.working_hours': 'Рабочие часы',
    'contact.hours_description': 'Понедельник-пятница: 9:00 - 18:00 (GMT)',
    'contact.weekend': 'Поддержка в выходные доступна для бизнес-подписок',
    'contact.response_time': 'Обычно мы отвечаем в течение 24 часов',
  }
};

const ContactPage: React.FC = () => {
  const { language } = useLanguage();
  
  // Get translation based on current language
  const getTranslation = (key: TranslationKeys): string => {
    return translations[language][key];
  };

  return (
    <div className='flex flex-col min-h-screen'>
      <PublicNavbar isNeedAdditionalLinks={true} />

      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">{getTranslation('contact.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto">
            {getTranslation('contact.subtitle')}
          </p>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8 mb-10">
            <p className="text-lg text-gray-700 mb-8 text-center">
              {getTranslation('contact.description')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Company Information */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Building className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {getTranslation('contact.company_info')}
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {getTranslation('contact.company_name')}
                      </h3>
                      <div className="flex items-start mt-2">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-600">
                          {getTranslation('contact.company_address')}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                        <p className="text-gray-600">
                          {getTranslation('contact.founded')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-600 italic">
                        "{getTranslation('contact.mission')}"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contact Methods */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <MessageCircle className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {getTranslation('contact.contact_methods')}
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Email */}
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <Mail className="h-5 w-5 text-blue-500 mr-2" />
                        {getTranslation('contact.email')}
                      </h3>
                      <p className="text-blue-600 mt-1 ml-7">
                        <a href="mailto:support@telepublisher.com" className="hover:underline">
                          {getTranslation('contact.email_address')}
                        </a>
                      </p>
                    </div>
                    
                    {/* Telegram */}
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <Send className="h-5 w-5 text-blue-500 mr-2" />
                        {getTranslation('contact.telegram')}
                      </h3>
                      <p className="text-gray-600 mt-1 ml-7">
                        {getTranslation('contact.telegram_handle')}
                      </p>
                      <div className="mt-2 ml-7">
                        <a href="https://t.me/telepublisher_support" target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" leftIcon={<Send size={16} />}>
                            {getTranslation('contact.telegram_btn')}
                          </Button>
                        </a>
                      </div>
                    </div>
                    
                    {/* YouTube */}
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <Youtube className="h-5 w-5 text-red-500 mr-2" />
                        {getTranslation('contact.youtube')}
                      </h3>
                      <p className="text-gray-600 mt-1 ml-7">
                        {getTranslation('contact.youtube_channel')}
                      </p>
                      <div className="mt-2 ml-7">
                        <a href="https://youtube.com/c/telepublisher" target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" leftIcon={<Youtube size={16} className="text-red-500" />}>
                            {getTranslation('contact.youtube_btn')}
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Working Hours */}
            <div className="mt-10 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                {getTranslation('contact.working_hours')}
              </h2>
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-gray-700">
                  {getTranslation('contact.hours_description')}
                </p>
                <p className="text-gray-600 mt-2">
                  {getTranslation('contact.weekend')}
                </p>
                <p className="text-blue-600 font-medium mt-4">
                  {getTranslation('contact.response_time')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 