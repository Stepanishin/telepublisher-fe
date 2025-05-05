import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Globe, Clock, Send, Lock, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import PublicNavbar from '../components/Layout/PublicNavbar';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <Send className="h-16 w-16 mx-auto mb-8" />
          <h1 className="text-5xl font-bold mb-6">TelePublisher</h1>
          <p className="text-xl max-w-3xl mx-auto mb-10">
            Профессиональная система для управления контентом в Telegram-каналах.
            Создавайте, редактируйте и публикуйте контент с легкостью.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/login">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
                Начать бесплатно
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-700">
                Узнать больше
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Наши возможности
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Zap className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Быстрая публикация</h3>
                <p className="text-gray-600">
                  Публикуйте контент мгновенно или планируйте публикации на будущее время.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Globe className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Множество каналов</h3>
                <p className="text-gray-600">
                  Управляйте несколькими каналами с единой панели администратора.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Clock className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Планирование</h3>
                <p className="text-gray-600">
                  Создавайте контент заранее и публикуйте по расписанию.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Безопасность</h3>
                <p className="text-gray-600">
                  Вход через Telegram без передачи паролей. Мы не храним чувствительных данных.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <Lock className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Приватность</h3>
                <p className="text-gray-600">
                  Мы не собираем личную информацию и не передаем данные третьим лицам.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-6">
                <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Удобный интерфейс</h3>
                <p className="text-gray-600">
                  Интуитивно понятный интерфейс для комфортной работы с контентом.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Тарифные планы
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Бесплатный</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">0 ₽<span className="text-sm text-gray-500 font-normal">/месяц</span></p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">До 3 каналов</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Базовые инструменты</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">До 30 публикаций в месяц</span>
                  </li>
                </ul>
                <Link to="/login">
                  <Button variant="outline" fullWidth>Начать бесплатно</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-500 shadow-md hover:shadow-lg transition-shadow relative">
              <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                <div className="bg-blue-600 text-white text-xs font-semibold py-1 px-3 rounded-full inline-block">
                  ПОПУЛЯРНЫЙ
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Стандарт</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">1 499 ₽<span className="text-sm text-gray-500 font-normal">/месяц</span></p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">До 10 каналов</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Планирование публикаций</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Неограниченные публикации</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Приоритетная поддержка</span>
                  </li>
                </ul>
                <Link to="/login">
                  <Button fullWidth>Выбрать план</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Бизнес</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">4 999 ₽<span className="text-sm text-gray-500 font-normal">/месяц</span></p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Неограниченное количество каналов</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Все функции планирования</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Аналитика и отчеты</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">API для интеграций</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Выделенная поддержка 24/7</span>
                  </li>
                </ul>
                <Link to="/login">
                  <Button variant="outline" fullWidth>Выбрать план</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Безопасность и приватность
          </h2>
          
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <div className="flex items-center justify-center mb-8">
              <Shield className="h-16 w-16 text-blue-600" />
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">
              Мы заботимся о вашей конфиденциальности
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">Авторизация через Telegram</h4>
                <p className="text-blue-800">
                  Вход в систему осуществляется исключительно через официальный виджет Telegram.
                  Мы никогда не запрашиваем ваш пароль от аккаунта Telegram.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">Безопасное хранение данных</h4>
                <p className="text-blue-800">
                  Мы не храним пароли пользователей. Ключи API хранятся в зашифрованном виде
                  и используются только для работы с вашими каналами.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">Прозрачность</h4>
                <p className="text-blue-800">
                  Вы всегда имеете полный контроль над своими данными и можете удалить аккаунт
                  и все связанные с ним данные в любой момент.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-2">Сертифицированная защита</h4>
                <p className="text-blue-800">
                  Вся информация передается по защищенному HTTPS-соединению. Наш сервис регулярно
                  проходит аудиты безопасности.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Начните использовать TelePublisher сегодня</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Присоединяйтесь к тысячам администраторов каналов, которые уже упростили свою работу
            с помощью нашего сервиса.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
              Зарегистрироваться бесплатно
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <Send className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-xl font-semibold text-white">TelePublisher</span>
              </div>
              <p className="mt-4 max-w-md text-gray-400">
                Профессиональный инструмент для создания, 
                управления и публикации контента в Telegram-каналах.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  Продукт
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#features" className="hover:text-white">Возможности</a>
                  </li>
                  <li>
                    <a href="#pricing" className="hover:text-white">Тарифы</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">Блог</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  Компания
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="hover:text-white">О нас</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">Контакты</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">Карьера</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  Правовая информация
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="hover:text-white">Условия использования</a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">Политика конфиденциальности</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-400 text-center">
            <p>&copy; {new Date().getFullYear()} TelePublisher. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 