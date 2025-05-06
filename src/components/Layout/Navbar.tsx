import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Send, Coins, Info, Globe } from 'lucide-react';
import Button from '../ui/Button';
import { useUserStore } from '../../store/userStore';
import { useCreditStore } from '../../store/creditStore';
import { useLanguage } from '../../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const { user, logout } = useUserStore();
  const { creditInfo, fetchCreditInfo } = useCreditStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (user) {
      fetchCreditInfo();
    }
  }, [user, fetchCreditInfo]);

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Call the logout function from the store
    logout();
    // Navigate to login page
    navigate('/login');
  };

  // Format date to a readable string
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return t('navbar.no_data');
    
    if (language === 'en') {
      return new Date(date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else {
      return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  // Toggle language between English and Russian
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <Send className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                TelePublisher
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            {/* Language toggle button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-1 bg-gray-100 rounded-md mr-4 text-sm hover:bg-gray-200 transition-colors"
            >
              <Globe className="h-4 w-4 text-gray-600 mr-2" />
              <span className="font-medium">{language === 'en' ? 'EN' : 'RU'}</span>
            </button>
            
            {creditInfo && (
              <div 
                className="relative flex items-center px-3 py-1 bg-blue-50 rounded-md mr-4 cursor-pointer"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Coins className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">
                  {creditInfo.currentCredits} / {creditInfo.maxCredits} {t('navbar.credits')}
                </span>
                <Info className="h-3 w-3 text-blue-400 ml-1" />
                
                {showTooltip && (
                  <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-white shadow-lg rounded-md z-50 text-xs">
                    <div className="font-semibold text-gray-900 mb-2">{t('navbar.credit_info')}</div>
                    <div className="space-y-1 text-gray-700">
                      <div className="flex justify-between">
                        <span>{t('navbar.subscription_type')}:</span>
                        <span className="font-medium">{creditInfo.subscriptionType.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('navbar.total_used')}:</span>
                        <span className="font-medium">{creditInfo.totalUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('navbar.reset_date')}:</span>
                        <span className="font-medium">{formatDate(creditInfo.resetDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('navbar.subscription_status')}:</span>
                        <span className={`font-medium ${creditInfo.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {creditInfo.isActive ? t('navbar.active') : t('navbar.inactive')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {user && (
              <div className="flex items-center mr-4">
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={`${user.username}'s avatar`} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="ml-2 text-gray-700">@{user.username}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut size={16} />}
              onClick={handleLogout}
              className="hover:!bg-blue-700"
            >
              {t('navbar.logout')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;