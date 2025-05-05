import React, { useState } from 'react';
import { Send } from 'lucide-react';
import TelegramLoginButton, { TelegramUser } from 'react-telegram-login';
import { verifyTelegramLogin } from '../services/api';
import { useUserStore } from '../store/userStore';

const LoginPage: React.FC = () => {
  const [error, setError] = useState('');
  const { login: loginUser } = useUserStore();

  const handleTelegramResponse = async (response: TelegramUser) => {
    try {
      setError('');
      const user = await verifyTelegramLogin(response);
      loginUser(user);
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка входа. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="text-center mb-8">
        <Send className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">TelePublisher</h1>
        <p className="text-lg text-gray-600">
          Система управления контентом для Telegram-каналов
        </p>
      </div>
      
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Вход в систему
        </h2>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center mb-6">
          <TelegramLoginButton
            botName="tele_publisher_login_bot"
            dataOnauth={handleTelegramResponse}
            buttonSize="large"
            cornerRadius={8}
            requestAccess="write"
          />
        </div>
        
        <p className="mt-6 text-center text-xs text-gray-500">
          Нажимая кнопку, вы соглашаетесь с условиями использования сервиса
        </p>
      </div>
    </div>
  );
};

export default LoginPage;