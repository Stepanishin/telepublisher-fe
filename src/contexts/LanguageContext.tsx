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

    // Content Generator
    'content_generator.title': 'Content Generator',
    'content_generator.prompt_label': 'Enter prompt',
    'content_generator.prompt_placeholder': 'What content should be generated?',
    'content_generator.generate_text': 'Generate text',
    'content_generator.generate_image': 'Generate image',
    'content_generator.generate_tags': 'Generate tags',
    'content_generator.credits': 'credit',
    'content_generator.credits_plural': 'credits',
    'content_generator.generation_results': 'Generation results:',
    'content_generator.text': 'Text:',
    'content_generator.image': 'Image:',
    'content_generator.tags': 'Tags:',
    'content_generator.error_text': 'Error generating text',
    'content_generator.error_image': 'Error generating image',
    'content_generator.error_tags': 'Error generating tags',

    // Publish Panel
    'publish_panel.title': 'Publication Panel',
    'publish_panel.select_channel': 'Select channel',
    'publish_panel.select_channels': 'Select channels',
    'publish_panel.select_channel_error': 'Select a channel',
    'publish_panel.no_channel_error': 'Select a channel for publication',
    'publish_panel.no_content_error': 'Add text or image for publication',
    'publish_panel.text_label': 'Publication text',
    'publish_panel.text_placeholder': 'Enter publication text...',
    'publish_panel.image_url': 'Image URL',
    'publish_panel.image_url_placeholder': 'https://example.com/image.jpg',
    'publish_panel.tags': 'Tags',
    'publish_panel.image_preview': 'Image preview',
    'publish_panel.publish_button': 'Publish',
    'publish_panel.multiple_selection_hint': 'Click to open dropdown and select multiple channels',
    'publish_panel.publish_to_multiple': 'Publish to {count} channels',
    'publish_panel.publishing_progress': 'Publishing Progress',
    'publish_panel.channels': 'channels',
    'publish_panel.success_publish': 'Successfully published to:',
    'publish_panel.failed_publish': 'Failed to publish to:',

    // Channels Manager
    'channels_manager.title': 'Channel Management',
    'channels_manager.add_new_channel': 'Add new channel',
    'channels_manager.channel_username': '@channel username',
    'channels_manager.bot_token': 'Bot token',
    'channels_manager.add_channel': 'Add channel',
    'channels_manager.connected_channels': 'Connected channels:',
    'channels_manager.no_connected_channels': 'No connected channels',
    'channels_manager.token_configured': 'Token configured',
    'channels_manager.token_not_configured': 'Token not configured',
    'channels_manager.change_token': 'Change token',
    'channels_manager.add_token': 'Add token',
    'channels_manager.delete': 'Delete',
    'channels_manager.delete_channel': 'Delete channel',
    'channels_manager.delete_confirmation': 'Are you sure you want to delete channel "{0}"? This action cannot be undone.',
    'channels_manager.confirm_delete': 'Delete',
    'channels_manager.cancel': 'Cancel',
    'channels_manager.token_setup': 'Token setup for channel "{0}"',
    'channels_manager.enter_token': 'Enter Telegram bot token for this channel:',
    'channels_manager.save': 'Save',
    'channels_manager.error_username': 'Enter channel username',
    'channels_manager.error_already_added': 'Channel with this name is already added',
    'channels_manager.error_add_failed': 'Failed to add channel',
    'channels_manager.error_save_token': 'Failed to save token',
    'channels_manager.error_delete_channel': 'Failed to delete channel',
    'channels_manager.channels_limit': 'Channels: {0} of {1}',
    'channels_manager.unlimited_channels': 'Channels: Unlimited',
    'channels_manager.limit_reached': 'Channel limit reached',
    'channels_manager.error_limit_reached': 'Channel limit reached for your subscription',
    'channels_manager.upgrade_subscription': 'To add more channels, please upgrade your subscription',

    // Bot Instructions Panel
    'instructions.bot_title': 'Bot Creation Instructions',
    'instructions.service_title': 'TelePublisher Service Instructions',
    'instructions.collapse': 'Collapse instructions',
    'instructions.service_description': 'TelePublisher is a service for managing content in Telegram channels. Here\'s a brief instruction on how to use our service:',
    'instructions.getting_started': 'Getting Started',
    'instructions.getting_started_step_1': 'Create a Telegram bot via BotFather (see instructions below)',
    'instructions.getting_started_step_2': 'Add your Telegram channel in the "Channel Management" section',
    'instructions.getting_started_step_3': 'Specify the bot token for your channel',
    'instructions.getting_started_step_4': 'Make sure the bot is added to the channel as an administrator',
    'instructions.content_creation': 'Content Creation',
    'instructions.content_creation_step_1': 'Go to the "Content Generation" tab',
    'instructions.content_creation_step_2': 'Use the editor to create a new post',
    'instructions.content_creation_step_3': 'You can format text, add emojis and media files',
    'instructions.content_creation_step_4': 'Post preview is available on the right side of the screen',
    'instructions.publishing': 'Publishing and Scheduling',
    'instructions.publishing_step_1': 'Select a channel for publication in the right panel',
    'instructions.publishing_step_2': 'For instant publication, click "Publish Now"',
    'instructions.publishing_step_3': 'To schedule a publication, select the date and time, then click "Schedule"',
    'instructions.publishing_step_4': 'Scheduled publications can be edited and canceled before sending',
    'instructions.channel_management': 'Channel Management',
    'instructions.channel_management_step_1': 'Go to the "Channel Management" tab',
    'instructions.channel_management_step_2': 'Add a new channel by specifying its username',
    'instructions.channel_management_step_3': 'A bot token must be configured for each channel',
    'instructions.channel_management_step_4': 'You can manage multiple channels simultaneously (limit depends on your subscription plan)',
    'instructions.usage_tips': 'Usage Tips',
    'instructions.usage_tips_item_1': 'Use different bots for different channels to enhance security',
    'instructions.usage_tips_item_2': 'Plan content in advance to ensure regular publications',
    'instructions.usage_tips_item_3': 'Use the preview function before publishing to ensure correct display',
    'instructions.usage_tips_item_4': 'Paid plans offer more channels and extended functionality',
    'instructions.questions': 'If you have any questions',
    'instructions.support_text': 'Contact our support team via Telegram:',
    
    'instructions.bot_desc': 'To publish posts in Telegram channels, you need to create a bot and get its token. Follow the instructions below:',
    'instructions.step1_title': 'Open BotFather in Telegram',
    'instructions.step1_desc': 'Go to the official Telegram bot for creating other bots',
    'instructions.open_botfather': 'Open BotFather',
    'instructions.step2_title': 'Send a command to create a new bot',
    'instructions.step2_desc': 'BotFather will ask you to set a name and username for the bot.',
    'instructions.step3_title': 'Save the API token',
    'instructions.step3_desc': 'After creating the bot, you will receive an API token that looks something like this:',
    'instructions.step3_note': 'You will need this token to configure the channel in our system.',
    'instructions.step4_title': 'Add the bot to your channel as an administrator',
    'instructions.step4_desc': 'Open the channel settings, go to "Administrators" and add your bot, giving it permission to publish messages. Use only the mobile version of Telegram to add a bot to a channel',
    'instructions.step5_title': 'Enter the bot token in the channel settings',
    'instructions.step5_desc': 'In the "Channel Management" section, add your Telegram channel and specify the bot token you received from BotFather.',
    'instructions.security_title': 'Security Recommendations',
    'instructions.security_tip_1': 'Never share your bot token with third parties',
    'instructions.security_tip_2': 'Use a separate bot for each channel',
    'instructions.security_tip_3': 'Regularly check the activity of your bots',
    'instructions.security_tip_4': 'If you suspect token compromise, create a new bot',

    // Subscription Manager
    'subscription.title': 'Subscription Management',
    'subscription.current_plan': 'Current plan',
    'subscription.credits_available': 'Available credits: {0} of {1}',
    'subscription.total_used': 'Total used: {0} credits',
    'subscription.reset_date': 'Credits reset date: {0}',
    'subscription.cancelled': 'Subscription Cancelled',
    'subscription.cancel_notice': 'Your subscription will be active until {0}, after which it will automatically downgrade to the free plan. Your accumulated credits will be preserved.',
    'subscription.free': 'Free',
    'subscription.standard': 'Standard',
    'subscription.business': 'Business',
    'subscription.free_price': '$0',
    'subscription.standard_price': '$10',
    'subscription.business_price': '$30',
    'subscription.month': 'month',
    'subscription.popular': 'POPULAR',
    'subscription.free_features_1': '10 AI credits per month',
    'subscription.free_features_2': 'Up to 2 channels',
    'subscription.free_features_3': 'Basic tools',
    'subscription.free_features_4': '2-10 trial publications',
    'subscription.standard_features_1': '100 AI credits per month',
    'subscription.standard_features_2': 'Up to 10 channels',
    'subscription.standard_features_3': 'Up to 100 publications',
    'subscription.standard_features_4': 'Priority support',
    'subscription.business_features_1': '400 AI credits per month',
    'subscription.business_features_2': 'Unlimited number of channels',
    'subscription.business_features_3': 'Up to 400 publications',
    'subscription.business_features_4': 'Dedicated support 24/7',
    'subscription.current_plan_button': 'Current plan',
    'subscription.subscribe_button': 'Subscribe',
    'subscription.manage_payments': 'Manage Payments',
    'subscription.cancel_subscription': 'Cancel Subscription',
    'subscription.renew_subscription': 'Renew Subscription',
    'subscription.loading': 'Loading...',
    'subscription.cancelling': 'Cancelling...',
    'subscription.payment_success': 'Payment successful! Your subscription has been activated.',
    'subscription.payment_cancelled': 'Payment was cancelled.',
    'subscription.error_load': 'Failed to load subscription information',
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

    // Content Generator
    'content_generator.title': 'Генератор контента',
    'content_generator.prompt_label': 'Введите промпт',
    'content_generator.prompt_placeholder': 'О чем сгенерировать контент?',
    'content_generator.generate_text': 'Сгенерировать текст',
    'content_generator.generate_image': 'Сгенерировать изображение',
    'content_generator.generate_tags': 'Сгенерировать теги',
    'content_generator.credits': 'кредит',
    'content_generator.credits_plural': 'кредита',
    'content_generator.generation_results': 'Результат генерации:',
    'content_generator.text': 'Текст:',
    'content_generator.image': 'Изображение:',
    'content_generator.tags': 'Теги:',
    'content_generator.error_text': 'Ошибка при генерации текста',
    'content_generator.error_image': 'Ошибка при генерации изображения',
    'content_generator.error_tags': 'Ошибка при генерации тегов',

    // Publish Panel
    'publish_panel.title': 'Панель публикации',
    'publish_panel.select_channel': 'Выберите канал',
    'publish_panel.select_channels': 'Выберите каналы',
    'publish_panel.select_channel_error': 'Выберите канал',
    'publish_panel.no_channel_error': 'Выберите канал для публикации',
    'publish_panel.no_content_error': 'Добавьте текст или изображение для публикации',
    'publish_panel.text_label': 'Текст публикации',
    'publish_panel.text_placeholder': 'Введите текст публикации...',
    'publish_panel.image_url': 'URL изображения',
    'publish_panel.image_url_placeholder': 'https://example.com/image.jpg',
    'publish_panel.tags': 'Теги',
    'publish_panel.image_preview': 'Предпросмотр изображения',
    'publish_panel.publish_button': 'Опубликовать',
    'publish_panel.multiple_selection_hint': 'Нажмите, чтобы открыть выпадающий список и выбрать несколько каналов',
    'publish_panel.publish_to_multiple': 'Опубликовать в {count} каналах',
    'publish_panel.publishing_progress': 'Прогресс публикации',
    'publish_panel.channels': 'каналов',
    'publish_panel.success_publish': 'Успешно опубликовано в:',
    'publish_panel.failed_publish': 'Не удалось опубликовать в:',

    // Channels Manager
    'channels_manager.title': 'Управление каналами',
    'channels_manager.add_new_channel': 'Добавить новый канал',
    'channels_manager.channel_username': '@username канала',
    'channels_manager.bot_token': 'Токен бота',
    'channels_manager.add_channel': 'Добавить канал',
    'channels_manager.connected_channels': 'Подключенные каналы:',
    'channels_manager.no_connected_channels': 'Нет подключенных каналов',
    'channels_manager.token_configured': 'Токен настроен',
    'channels_manager.token_not_configured': 'Токен не настроен',
    'channels_manager.change_token': 'Изменить токен',
    'channels_manager.add_token': 'Добавить токен',
    'channels_manager.delete': 'Удалить',
    'channels_manager.delete_channel': 'Удаление канала',
    'channels_manager.delete_confirmation': 'Вы уверены, что хотите удалить канал "{0}"? Это действие нельзя отменить.',
    'channels_manager.confirm_delete': 'Удалить',
    'channels_manager.cancel': 'Отмена',
    'channels_manager.token_setup': 'Настройка токена для канала "{0}"',
    'channels_manager.enter_token': 'Введите токен Telegram бота для этого канала:',
    'channels_manager.save': 'Сохранить',
    'channels_manager.error_username': 'Введите имя пользователя канала',
    'channels_manager.error_already_added': 'Канал с таким именем уже добавлен',
    'channels_manager.error_add_failed': 'Не удалось добавить канал',
    'channels_manager.error_save_token': 'Не удалось сохранить токен',
    'channels_manager.error_delete_channel': 'Не удалось удалить канал',
    'channels_manager.channels_limit': 'Каналы: {0} из {1}',
    'channels_manager.unlimited_channels': 'Каналы: Без ограничений',
    'channels_manager.limit_reached': 'Достигнут лимит каналов',
    'channels_manager.error_limit_reached': 'Достигнут лимит каналов для вашей подписки',
    'channels_manager.upgrade_subscription': 'Для добавления большего числа каналов обновите подписку',

    // Bot Instructions Panel
    'instructions.bot_title': 'Инструкция по созданию бота',
    'instructions.service_title': 'Инструкция по использованию сервиса TelePublisher',
    'instructions.collapse': 'Свернуть инструкцию',
    'instructions.service_description': 'TelePublisher — это сервис для управления контентом в Telegram-каналах. Вот краткая инструкция, как использовать наш сервис:',
    'instructions.getting_started': 'Начало работы',
    'instructions.getting_started_step_1': 'Создайте Telegram бота через BotFather (см. инструкцию ниже)',
    'instructions.getting_started_step_2': 'Добавьте ваш Telegram-канал в разделе "Управление каналами"',
    'instructions.getting_started_step_3': 'Укажите токен бота для вашего канала',
    'instructions.getting_started_step_4': 'Убедитесь, что бот добавлен в канал как администратор',
    'instructions.content_creation': 'Создание контента',
    'instructions.content_creation_step_1': 'Перейдите во вкладку "Генерация контента"',
    'instructions.content_creation_step_2': 'Используйте редактор для создания нового поста',
    'instructions.content_creation_step_3': 'Вы можете форматировать текст, добавлять эмодзи и медиафайлы',
    'instructions.content_creation_step_4': 'Предварительный просмотр поста доступен в правой части экрана',
    'instructions.publishing': 'Публикация и планирование',
    'instructions.publishing_step_1': 'Выберите канал для публикации в панели справа',
    'instructions.publishing_step_2': 'Для мгновенной публикации нажмите "Опубликовать сейчас"',
    'instructions.publishing_step_3': 'Для планирования публикации выберите дату и время, затем нажмите "Запланировать"',
    'instructions.publishing_step_4': 'Запланированные публикации можно редактировать и отменять до момента отправки',
    'instructions.channel_management': 'Управление каналами',
    'instructions.channel_management_step_1': 'Перейдите во вкладку "Управление каналами"',
    'instructions.channel_management_step_2': 'Добавьте новый канал, указав его username',
    'instructions.channel_management_step_3': 'Для каждого канала необходимо настроить токен бота',
    'instructions.channel_management_step_4': 'Вы можете управлять несколькими каналами одновременно (лимит зависит от тарифного плана)',
    'instructions.usage_tips': 'Советы по использованию',
    'instructions.usage_tips_item_1': 'Используйте разные боты для разных каналов для повышения безопасности',
    'instructions.usage_tips_item_2': 'Планируйте контент заранее, чтобы обеспечить регулярность публикаций',
    'instructions.usage_tips_item_3': 'Используйте функцию предпросмотра перед публикацией, чтобы убедиться в корректном отображении',
    'instructions.usage_tips_item_4': 'В платных тарифах доступно больше каналов и расширенная функциональность',
    'instructions.questions': 'Если у вас возникли вопросы',
    'instructions.support_text': 'Свяжитесь с нашей службой поддержки через Telegram:',
    
    'instructions.bot_desc': 'Для публикации постов в Telegram-каналы вам необходимо создать бота и получить его токен. Следуйте инструкции ниже:',
    'instructions.step1_title': 'Откройте BotFather в Telegram',
    'instructions.step1_desc': 'Перейдите к официальному боту Telegram для создания других ботов',
    'instructions.open_botfather': 'Открыть BotFather',
    'instructions.step2_title': 'Отправьте команду для создания нового бота',
    'instructions.step2_desc': 'BotFather попросит вас задать имя и имя пользователя для бота.',
    'instructions.step3_title': 'Сохраните токен API',
    'instructions.step3_desc': 'После создания бота вы получите токен API, выглядящий примерно так:',
    'instructions.step3_note': 'Этот токен вам понадобится для настройки канала в нашей системе.',
    'instructions.step4_title': 'Добавьте бота в ваш канал как администратора',
    'instructions.step4_desc': 'Откройте настройки канала, перейдите в "Администраторы" и добавьте вашего бота, предоставив ему права на публикацию сообщений. Используйте только мобильную версию Telegram для добавления бота в канал',
    'instructions.step5_title': 'Введите токен бота в настройках канала',
    'instructions.step5_desc': 'В разделе "Управление каналами" добавьте ваш Telegram-канал и укажите токен бота, который вы получили от BotFather.',
    'instructions.security_title': 'Рекомендации по безопасности',
    'instructions.security_tip_1': 'Никогда не делитесь токеном бота с третьими лицами',
    'instructions.security_tip_2': 'Используйте отдельного бота для каждого канала',
    'instructions.security_tip_3': 'Регулярно проверяйте активность ваших ботов',
    'instructions.security_tip_4': 'При подозрении на компрометацию токена, создайте нового бота',

    // Subscription Manager
    'subscription.title': 'Управление подпиской',
    'subscription.current_plan': 'Текущий план',
    'subscription.credits_available': 'Доступно кредитов: {0} из {1}',
    'subscription.total_used': 'Использовано всего: {0} кредитов',
    'subscription.reset_date': 'Дата обновления кредитов: {0}',
    'subscription.cancelled': 'Подписка отменена',
    'subscription.cancel_notice': 'Ваша подписка будет действовать до {0}, после чего будет автоматически переведена на бесплатный план. Ваши накопленные кредиты будут сохранены.',
    'subscription.free': 'Бесплатный',
    'subscription.standard': 'Стандарт',
    'subscription.business': 'Бизнес',
    'subscription.free_price': '0 $',
    'subscription.standard_price': '10$',
    'subscription.business_price': '30$',
    'subscription.month': 'месяц',
    'subscription.popular': 'Популярный',
    'subscription.free_features_1': '10 AI-кредитов в месяц',
    'subscription.free_features_2': 'До 2 каналов',
    'subscription.free_features_3': 'Базовые инструменты',
    'subscription.free_features_4': '2-10 пробных публикаций',
    'subscription.standard_features_1': '100 AI-кредитов в месяц',
    'subscription.standard_features_2': 'До 10 каналов',
    'subscription.standard_features_3': 'До 100 публикаций',
    'subscription.standard_features_4': 'Приоритетная поддержка',
    'subscription.business_features_1': '400 AI-кредитов в месяц',
    'subscription.business_features_2': 'Неограниченное количество каналов',
    'subscription.business_features_3': 'До 400 публикаций',
    'subscription.business_features_4': 'Выделенная поддержка 24/7',
    'subscription.current_plan_button': 'Текущий тариф',
    'subscription.subscribe_button': 'Оформить подписку',
    'subscription.manage_payments': 'Управление платежами',
    'subscription.cancel_subscription': 'Отменить подписку',
    'subscription.renew_subscription': 'Возобновить подписку',
    'subscription.loading': 'Загрузка...',
    'subscription.cancelling': 'Отмена...',
    'subscription.payment_success': 'Оплата прошла успешно! Подписка активирована.',
    'subscription.payment_cancelled': 'Оплата была отменена.',
    'subscription.error_load': 'Не удалось загрузить информацию о подписке',
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