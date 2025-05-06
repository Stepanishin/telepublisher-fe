import React from 'react';
import { FileText, Shield, ExternalLink } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import PublicNavbar from '../components/Layout/PublicNavbar';
import { Card, CardContent } from '../components/ui/Card';

// Define the translation type
type TranslationKeys = 
  | 'terms.title' | 'terms.subtitle' | 'terms.last_updated'
  | 'terms.terms_section_title' | 'terms.privacy_section_title'
  | 'terms.acceptance' | 'terms.acceptance_text'
  | 'terms.service_description' | 'terms.service_description_text'
  | 'terms.user_obligations' | 'terms.user_obligations_text'
  | 'terms.prohibited_activities' | 'terms.prohibited_activities_text'
  | 'terms.termination' | 'terms.termination_text'
  | 'terms.disclaimer' | 'terms.disclaimer_text'
  | 'terms.limitation_liability' | 'terms.limitation_liability_text'
  | 'terms.governing_law' | 'terms.governing_law_text'
  | 'terms.privacy_data_collection' | 'terms.privacy_data_collection_text'
  | 'terms.privacy_data_usage' | 'terms.privacy_data_usage_text'
  | 'terms.privacy_cookies' | 'terms.privacy_cookies_text'
  | 'terms.privacy_third_parties' | 'terms.privacy_third_parties_text'
  | 'terms.privacy_security' | 'terms.privacy_security_text'
  | 'terms.privacy_rights' | 'terms.privacy_rights_text'
  | 'terms.privacy_changes' | 'terms.privacy_changes_text'
  | 'terms.contact_section' | 'terms.contact_section_text';

// Add translations for Terms page
const translations: Record<Language, Record<TranslationKeys, string>> = {
  en: {
    'terms.title': 'Terms of Service & Privacy Policy',
    'terms.subtitle': 'Last Updated: May 1, 2023',
    'terms.last_updated': 'Last Updated',
    'terms.terms_section_title': 'Terms of Service',
    'terms.privacy_section_title': 'Privacy Policy',
    
    'terms.acceptance': '1. Acceptance of Terms',
    'terms.acceptance_text': 'By accessing or using the TelePublisher service, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.',
    
    'terms.service_description': '2. Description of Service',
    'terms.service_description_text': 'TelePublisher provides tools for managing and publishing content to Telegram channels. The service is provided "as is" and may change without notice.',
    
    'terms.user_obligations': '3. User Obligations',
    'terms.user_obligations_text': 'Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. Users must comply with all applicable laws regarding content publishing.',
    
    'terms.prohibited_activities': '4. Prohibited Activities',
    'terms.prohibited_activities_text': 'Users may not use the service for any illegal purpose or to violate any laws. Prohibited content includes but is not limited to: illegal content, hate speech, malware, spam, and content that infringes on intellectual property rights.',
    
    'terms.termination': '5. Termination',
    'terms.termination_text': 'We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.',
    
    'terms.disclaimer': '6. Disclaimer',
    'terms.disclaimer_text': 'The service is provided on an "as is" and "as available" basis. We do not guarantee that the service will be uninterrupted, secure, or error-free.',
    
    'terms.limitation_liability': '7. Limitation of Liability',
    'terms.limitation_liability_text': 'In no event shall TelePublisher be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.',
    
    'terms.governing_law': '8. Governing Law',
    'terms.governing_law_text': 'These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TelePublisher operates, without regard to its conflict of law provisions.',
    
    'terms.privacy_data_collection': '1. Information We Collect',
    'terms.privacy_data_collection_text': 'We collect information necessary to provide our services, including account information, usage data, and information you provide when using our service. We do not collect personal passwords from Telegram.',
    
    'terms.privacy_data_usage': '2. How We Use Your Information',
    'terms.privacy_data_usage_text': 'We use collected information to provide, maintain, and improve our services, to communicate with you, and to comply with legal obligations.',
    
    'terms.privacy_cookies': '3. Cookies and Tracking Technologies',
    'terms.privacy_cookies_text': 'We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.',
    
    'terms.privacy_third_parties': '4. Third-Party Services',
    'terms.privacy_third_parties_text': 'Our service may contain links to third-party websites or services that are not owned or controlled by TelePublisher. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.',
    
    'terms.privacy_security': '5. Security',
    'terms.privacy_security_text': 'The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure.',
    
    'terms.privacy_rights': '6. Your Data Rights',
    'terms.privacy_rights_text': 'You have the right to access, update, or delete your personal information. You can do this by contacting us directly or through account settings where available.',
    
    'terms.privacy_changes': '7. Changes to Privacy Policy',
    'terms.privacy_changes_text': 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.',
    
    'terms.contact_section': 'Questions About Our Terms or Privacy Policy?',
    'terms.contact_section_text': 'If you have any questions about these Terms or Privacy Policy, please contact us through our Contact page.'
  },
  ru: {
    'terms.title': 'Условия использования и Политика конфиденциальности',
    'terms.subtitle': 'Последнее обновление: 1 мая 2023 г.',
    'terms.last_updated': 'Последнее обновление',
    'terms.terms_section_title': 'Условия использования',
    'terms.privacy_section_title': 'Политика конфиденциальности',
    
    'terms.acceptance': '1. Принятие условий',
    'terms.acceptance_text': 'Используя сервис TelePublisher, вы соглашаетесь с настоящими Условиями использования и всеми применимыми законами и правилами. Если вы не согласны с любым из этих условий, вам запрещено использовать данный сервис.',
    
    'terms.service_description': '2. Описание услуги',
    'terms.service_description_text': 'TelePublisher предоставляет инструменты для управления и публикации контента в Telegram-каналах. Сервис предоставляется "как есть" и может изменяться без предварительного уведомления.',
    
    'terms.user_obligations': '3. Обязательства пользователя',
    'terms.user_obligations_text': 'Пользователи несут ответственность за сохранение конфиденциальности своей учетной записи и за все действия, которые происходят под их учетной записью. Пользователи должны соблюдать все применимые законы, касающиеся публикации контента.',
    
    'terms.prohibited_activities': '4. Запрещенные действия',
    'terms.prohibited_activities_text': 'Пользователи не могут использовать сервис для незаконных целей или для нарушения любых законов. Запрещенный контент включает, но не ограничивается: незаконный контент, разжигание ненависти, вредоносное ПО, спам и контент, нарушающий права интеллектуальной собственности.',
    
    'terms.termination': '5. Прекращение доступа',
    'terms.termination_text': 'Мы оставляем за собой право прекратить или приостановить доступ к нашему сервису немедленно, без предварительного уведомления, за поведение, которое, по нашему мнению, нарушает настоящие Условия использования или наносит вред другим пользователям, нам или третьим лицам.',
    
    'terms.disclaimer': '6. Отказ от ответственности',
    'terms.disclaimer_text': 'Сервис предоставляется на условиях "как есть" и "как доступно". Мы не гарантируем, что сервис будет бесперебойным, безопасным или безошибочным.',
    
    'terms.limitation_liability': '7. Ограничение ответственности',
    'terms.limitation_liability_text': 'TelePublisher ни при каких обстоятельствах не несет ответственности за любые косвенные, случайные, специальные, последующие или штрафные убытки, включая, без ограничений, потерю прибыли, данных, использования, репутации или других нематериальных потерь.',
    
    'terms.governing_law': '8. Применимое право',
    'terms.governing_law_text': 'Настоящие Условия регулируются и толкуются в соответствии с законами юрисдикции, в которой работает TelePublisher, без учета положений о коллизии правовых норм.',
    
    'terms.privacy_data_collection': '1. Информация, которую мы собираем',
    'terms.privacy_data_collection_text': 'Мы собираем информацию, необходимую для предоставления наших услуг, включая информацию об учетной записи, данные об использовании и информацию, которую вы предоставляете при использовании нашего сервиса. Мы не собираем личные пароли от Telegram.',
    
    'terms.privacy_data_usage': '2. Как мы используем вашу информацию',
    'terms.privacy_data_usage_text': 'Мы используем собранную информацию для предоставления, поддержки и улучшения наших услуг, для общения с вами и для соблюдения юридических обязательств.',
    
    'terms.privacy_cookies': '3. Файлы cookie и технологии отслеживания',
    'terms.privacy_cookies_text': 'Мы используем файлы cookie и аналогичные технологии отслеживания для отслеживания активности в нашем сервисе и хранения определенной информации. Вы можете настроить свой браузер отклонять все файлы cookie или указывать, когда файл cookie отправляется.',
    
    'terms.privacy_third_parties': '4. Сторонние сервисы',
    'terms.privacy_third_parties_text': 'Наш сервис может содержать ссылки на сторонние веб-сайты или услуги, которые не принадлежат и не контролируются TelePublisher. Мы не контролируем и не несем ответственности за содержание, политику конфиденциальности или практику любых сторонних веб-сайтов или услуг.',
    
    'terms.privacy_security': '5. Безопасность',
    'terms.privacy_security_text': 'Безопасность ваших данных важна для нас, но помните, что ни один метод передачи через Интернет или метод электронного хранения не является на 100% безопасным.',
    
    'terms.privacy_rights': '6. Ваши права на данные',
    'terms.privacy_rights_text': 'У вас есть право на доступ, обновление или удаление вашей личной информации. Вы можете сделать это, связавшись с нами напрямую или через настройки учетной записи, где это доступно.',
    
    'terms.privacy_changes': '7. Изменения в Политике конфиденциальности',
    'terms.privacy_changes_text': 'Мы можем время от времени обновлять нашу Политику конфиденциальности. Мы уведомим вас о любых изменениях, разместив новую Политику конфиденциальности на этой странице и обновив дату "последнего обновления".',
    
    'terms.contact_section': 'Вопросы о наших Условиях или Политике конфиденциальности?',
    'terms.contact_section_text': 'Если у вас есть какие-либо вопросы об этих Условиях или Политике конфиденциальности, пожалуйста, свяжитесь с нами через нашу страницу Контакты.'
  }
};

const TermsPage: React.FC = () => {
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
          <h1 className="text-4xl font-bold mb-4">{getTranslation('terms.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto">
            {getTranslation('terms.subtitle')}
          </p>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8 mb-10">
            
            {/* Terms of Service */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <FileText className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {getTranslation('terms.terms_section_title')}
                </h2>
              </div>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.acceptance')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.acceptance_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.service_description')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.service_description_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.user_obligations')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.user_obligations_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.prohibited_activities')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.prohibited_activities_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.termination')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.termination_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.disclaimer')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.disclaimer_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.limitation_liability')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.limitation_liability_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.governing_law')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.governing_law_text')}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Privacy Policy */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {getTranslation('terms.privacy_section_title')}
                </h2>
              </div>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.privacy_data_collection')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.privacy_data_collection_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.privacy_data_usage')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.privacy_data_usage_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.privacy_cookies')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.privacy_cookies_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.privacy_third_parties')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.privacy_third_parties_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.privacy_security')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.privacy_security_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.privacy_rights')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.privacy_rights_text')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {getTranslation('terms.privacy_changes')}
                  </h3>
                  <p className="text-gray-700">
                    {getTranslation('terms.privacy_changes_text')}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Contact Section */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center">
              <h3 className="font-semibold text-lg text-blue-800 mb-3">
                {getTranslation('terms.contact_section')}
              </h3>
              <p className="text-blue-700 mb-4">
                {getTranslation('terms.contact_section_text')}
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage; 