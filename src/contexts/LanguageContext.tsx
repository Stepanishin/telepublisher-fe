import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'en' | 'ru';

// Define context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

// Define translations for both languages
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    'navbar.logout': 'Logout',
    'navbar.credits': 'credits',
    'navbar.credit_info': 'Credit Information',
    'navbar.subscription_type': 'Subscription Type',
    'navbar.total_used': 'Total Used',
    'navbar.reset_date': 'Reset Date',
    'navbar.subscription_status': 'Subscription Status',
    'navbar.active': 'Active',
    'navbar.inactive': 'Inactive',
    'navbar.no_data': 'No data',
    
    // Hero section
    'hero.title': 'TelePublisher',
    'hero.description': 'Professional content management system for Telegram channels. Create, edit and publish content with ease.',
    'hero.start_free': 'Start for free',
    'hero.learn_more': 'Learn more',

    // Features section
    'features.title': 'Our features',
    'features.fast_publication': 'Fast publication',
    'features.fast_publication_description': 'Publish content instantly or schedule publications for future times.',
    'features.multiple_channels': 'Multiple channels',
    'features.multiple_channels_description': 'Manage multiple channels from a single admin panel.',
    'features.ai_content': 'AI Content Generation',
    'features.ai_content_description': 'Create high-quality content, images, and hashtags using advanced AI tools.',
    'features.content_management': 'Content management',
    'features.easy_interface': 'Easy interface',
    'features.easy_interface_description': 'Intuitive interface for comfortable content management.',
    'features.security': 'Security',
    'features.security_description': 'Login through Telegram without password transfer. We do not store sensitive data.',
    'features.privacy': 'Privacy',
    'features.privacy_description': 'We do not collect personal information and do not transfer data to third parties.',

    // Pricing section
    'pricing.title': 'Pricing plans',
    'pricing.free': 'Free',
    'pricing.free_channels': 'Up to 2 channels',
    'pricing.basic-tools': 'Basic tools',
    'pricing.free_publications': '2-10 trial publications',
    'pricing.start-free': 'Start for free',
    'pricing.mounth': 'month',

    'pricing.popular': 'POPULAR',
    'pricing.standard': 'Standart',
    'pricing.standard_channels': 'Up to 10 channels',
    'pricing.standard_publications': 'Up to 100 publications',
    'pricing.standard_support': 'Priority support',
    'pricing.choose_plan': 'Choose plan',

    'pricing.business': 'Business',
    'pricing.business_channels': 'Unlimited number of channels',
    'pricing.business_publications': 'Up to 400 publications',
    'pricing.business_support': 'Dedicated support 24/7',

    // Security Section
    'security.title': 'Security and privacy',
    'security.description': 'We care about your privacy',
    'security.login': 'Authorization through Telegram',
    'security.no_password': 'The system is only accessible through the official Telegram widget. We never request your Telegram account password.',          
    'security.no_data': 'Safe data storage',
    'security.no_data_description': 'We do not store user passwords. API keys are stored in encrypted form and are used only for working with your channels.',
    'security.transparency': 'Transparency',
    'security.transparency_description': 'You always have full control over your data and can delete your account and all associated data at any time.',
    'security.protection': 'Certified protection',
    'security.protection_description': 'All information is transmitted over a secure HTTPS connection. Our service regularly undergoes security audits.',

    // Call to Action
    'call_to_action.title': 'Start using TelePublisher today',
    'call_to_action.description': 'Join thousands of channel administrators who have already simplified their work with our service.',
    'call_to_action.start_free': 'Start for free',

    // Footer
    'footer.description': 'Professional tool for creating, managing and publishing content in Telegram channels.',
    'footer.product': 'Product',
    'footer.company': 'Company',
    'footer.features': 'Features',
    'footer.pricing': 'Pricing',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.legal_info': 'Legal information',
    'footer.terms_of_service': 'Terms of service',
    'footer.privacy_policy': 'Privacy policy',
    'footer.copyright': 'All rights reserved.',

    // Login Page
    'login.title': 'TelePublisher',
    'login.subtitle': 'Content management system for Telegram channels',
    'login.heading': 'Sign in',
    'login.error': 'Login error. Please try again.',
    'login.switch_account': 'Switch Account',
    'login.switch_account_description': 'To switch accounts, follow the link below. This will open Telegram where you can choose another account.',
    'login.direct_login': 'Sign in with another Telegram account',
    'login.back_to_normal': 'Back to normal login',
    'login.terms_agreement': 'By clicking the button, you agree to the terms of service',
    'login.loading': 'Loading...',

    // Dashboard Page
    'dashboard.title': 'Content Management',
    'dashboard.subtitle': 'Create, edit, and publish content to Telegram channels',
    'dashboard.tab_content': 'Content Generation',
    'dashboard.tab_channels': 'Channel Management',
    'dashboard.tab_instructions': 'Instructions',
    'dashboard.tab_subscription': 'Subscription',
  },
  ru: {
    // Navbar
    'navbar.logout': 'Выйти',
    'navbar.credits': 'кредитов',
    'navbar.credit_info': 'Информация о кредитах',
    'navbar.subscription_type': 'Тип подписки',
    'navbar.total_used': 'Всего использовано',
    'navbar.reset_date': 'Сброс кредитов',
    'navbar.subscription_status': 'Статус подписки',
    'navbar.active': 'Активна',
    'navbar.inactive': 'Неактивна',
    'navbar.no_data': 'Нет данных',

    // Hero section
    'hero.title': 'TelePublisher',
    'hero.description': 'Профессиональная система для управления контентом в Telegram-каналах. Создавайте, редактируйте и публикуйте контент с легкостью.',
    'hero.start_free': 'Начать бесплатно',
    'hero.learn_more': 'Узнать больше',

    // Features section
    'features.title': 'Наши возможности',
    'features.fast_publication': 'Быстрая публикация',
    'features.fast_publication_description': 'Публикуйте контент мгновенно или планируйте публикации на будущее время.',
    'features.multiple_channels': 'Множество каналов',
    'features.multiple_channels_description': 'Управляйте несколькими каналами с единой панели администратора.',
    'features.ai_content': 'AI-генерация контента',
    'features.ai_content_description': 'Создавайте качественный контент, изображения и хэштеги с помощью продвинутых ИИ-инструментов.',
    'features.content_management': 'Управление контентом',
    'features.easy_interface': 'Удобный интерфейс',
    'features.easy_interface_description': 'Интуитивно понятный интерфейс для комфортной работы с контентом.',
    'features.security': 'Безопасность',
    'features.security_description': 'Вход через Telegram без передачи паролей. Мы не храним чувствительных данных.',
    'features.privacy': 'Приватность',
    'features.privacy_description': 'Мы не собираем личную информацию и не передаем данные третьим лицам.',

    // Pricing section
    'pricing.title': 'Тарифные планы',
    'pricing.free': 'Бесплатный',
    'pricing.free_channels': 'До 2 каналов',
    'pricing.basic-tools': 'Базовые инструменты',
    'pricing.free_publications': '2-10 пробных публикаций',
    'pricing.start-free': 'Начать бесплатно',
    'pricing.mounth': 'месяц',


    'pricing.popular': 'ПОПУЛЯРНЫЙ',
    'pricing.standard': 'Стандарт',
    'pricing.standard_channels': 'До 10 каналов',
    'pricing.standard_publications': 'До 100 публикаций',
    'pricing.standard_support': 'Приоритетная поддержка',
    'pricing.choose_plan': 'Выбрать план',


    'pricing.business': 'Бизнес',
    'pricing.business_channels': 'Неограниченное количество каналов',
    'pricing.business_publications': 'До 400 публикаций',
    'pricing.business_support': 'Выделенная поддержка 24/7',

    // Security Section
    'security.title': 'Безопасность и приватность',
    'security.description': 'Мы заботимся о вашей конфиденциальности',
    'security.login': 'Авторизация через Telegram',
    'security.no_password': 'Вход в систему осуществляется исключительно через официальный виджет Telegram. Мы никогда не запрашиваем ваш пароль от аккаунта Telegram.',          
    'security.no_data': 'Безопасное хранение данных',
    'security.no_data_description': 'Мы не храним пароли пользователей. Ключи API хранятся в зашифрованном виде и используются только для работы с вашими каналами.',
    'security.transparency': 'Прозрачность',
    'security.transparency_description': 'Вы всегда имеете полный контроль над своими данными и можете удалить аккаунт и все связанные с ним данные в любой момент.',
    'security.protection': 'Сертифицированная защита',
    'security.protection_description': 'Вся информация передается по защищенному HTTPS-соединению. Наш сервис регулярно проходит аудиты безопасности.',

    // Call to Action
    'call_to_action.title': 'Начните использовать TelePublisher сегодня',
    'call_to_action.description': 'Присоединяйтесь к тысячам администраторов каналов, которые уже упростили свою работу с помощью нашего сервиса.',
    'call_to_action.start_free': 'Зарегистрироваться бесплатно',

    // Footer
    'footer.description': 'Профессиональный инструмент для создания, управления и публикации контента в Telegram-каналах.',
    'footer.product': 'Продукт',
    'footer.company': 'Компания',
    'footer.features': 'Возможности',
    'footer.pricing': 'Тарифы',
    'footer.about': 'О нас',
    'footer.contact': 'Контакты',
    'footer.legal_info': 'Правовая информация',
    'footer.terms_of_service': 'Условия использования',
    'footer.privacy_policy': 'Политика конфиденциальности',
    'footer.copyright': 'Все права защищены.',

    // Login Page
    'login.title': 'TelePublisher',
    'login.subtitle': 'Система управления контентом для Telegram-каналов',
    'login.heading': 'Вход в систему',
    'login.error': 'Ошибка входа. Пожалуйста, попробуйте снова.',
    'login.switch_account': 'Сменить аккаунт',
    'login.switch_account_description': 'Для смены аккаунта перейдите по ссылке ниже. Это откроет Телеграм, где вы сможете выбрать другой аккаунт.',
    'login.direct_login': 'Войти с другим аккаунтом Telegram',
    'login.back_to_normal': 'Вернуться к обычному входу',
    'login.terms_agreement': 'Нажимая кнопку, вы соглашаетесь с условиями использования сервиса',
    'login.loading': 'Загрузка...',

    // Dashboard Page
    'dashboard.title': 'Управление контентом',
    'dashboard.subtitle': 'Создавайте, редактируйте и публикуйте контент в Telegram-каналы',
    'dashboard.tab_content': 'Генерация контента',
    'dashboard.tab_channels': 'Управление каналами',
    'dashboard.tab_instructions': 'Инструкция',
    'dashboard.tab_subscription': 'Подписка',
  },
};

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Try to get language from localStorage, default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage && ['en', 'ru'].includes(savedLanguage) ? savedLanguage : 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Set language function
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = () => useContext(LanguageContext); 