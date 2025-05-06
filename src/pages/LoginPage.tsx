import React, { useState, useEffect } from 'react';
import { Send, LogOut, ExternalLink } from 'lucide-react';
import TelegramLoginButton, { TelegramUser } from 'react-telegram-login';
import { verifyTelegramLogin, getUserProfile } from '../services/api';
import { useUserStore } from '../store/userStore';
import Button from '../components/ui/Button';

// Component for direct Telegram login link
const DirectTelegramLoginButton: React.FC = () => {
  const botName = 'tele_publisher_login_bot';
  
  return (
    <a 
      href={`https://t.me/${botName}?start=auth`}
      className="flex items-center justify-center px-4 py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      <ExternalLink size={16} className="mr-2" />
      Войти с другим аккаунтом Telegram
    </a>
  );
};

const LoginPage: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDirectLogin, setShowDirectLogin] = useState(false);
  const { login: loginUser, isAuthenticated } = useUserStore();
  const [telegramButtonKey, setTelegramButtonKey] = useState(Date.now().toString());

  // Try to auto-login when component mounts
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        if (token && !isAuthenticated) {
          setLoading(true);
          // Try to get user profile with existing token
          const user = await getUserProfile();
          if (user) {
            loginUser(user);
          } else {
            // If no user returned, clear token
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Auto-login failed:', error);
        // Clear token if it's invalid
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, [loginUser, isAuthenticated]);

  // Check for forceNewLogin parameter and generate new key for Telegram button
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('forceNewLogin')) {
      // Generate new key to force re-render of Telegram button
      setTelegramButtonKey(Date.now().toString());
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('forceNewLogin');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  const handleTelegramResponse = async (response: TelegramUser) => {
    try {
      setError('');
      setLoading(true);
      const user = await verifyTelegramLogin(response);
      loginUser(user);
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка входа. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  // Function to show the direct login option
  const handleSwitchAccount = () => {
    // Clear localStorage token
    localStorage.removeItem('token');
    
    // Toggle showing direct login button
    setShowDirectLogin(true);
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
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center mb-6">
              {!showDirectLogin ? (
                <>
                  <TelegramLoginButton
                    key={telegramButtonKey}
                    botName="tele_publisher_login_bot"
                    dataOnauth={handleTelegramResponse}
                    buttonSize="large"
                    cornerRadius={8}
                    requestAccess="write"
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    leftIcon={<LogOut size={16} />}
                    onClick={handleSwitchAccount}
                  >
                    Сменить аккаунт
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    Для смены аккаунта перейдите по ссылке ниже. Это откроет Телеграм, где вы сможете выбрать другой аккаунт.
                  </p>
                  <DirectTelegramLoginButton />
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowDirectLogin(false)}
                  >
                    Вернуться к обычному входу
                  </Button>
                </>
              )}
            </div>
            
            <p className="mt-6 text-center text-xs text-gray-500">
              Нажимая кнопку, вы соглашаетесь с условиями использования сервиса
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;