import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Send, Coins, Info, Globe, Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import { useUserStore } from '../../store/userStore';
import { useCreditStore } from '../../store/creditStore';
import { useLanguage } from '../../contexts/LanguageContext';

const Navbar: React.FC = () => {
  const { user, logout } = useUserStore();
  const { creditInfo, fetchCreditInfo } = useCreditStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Rendering functions that take care of null checks
  const renderCreditInfo = () => {
    if (!creditInfo) return null;
    
    return (
      <div 
        className="relative flex items-center px-3 py-1 bg-blue-50 rounded-md cursor-pointer"
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
    );
  };

  const renderUserInfo = () => {
    if (!user) return null;
    
    return (
      <div className="flex items-center">
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
    );
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <Send className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                TelePublisher
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center">
            {/* Language toggle button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-1 bg-gray-100 rounded-md mr-4 text-sm hover:bg-gray-200 transition-colors"
            >
              <Globe className="h-4 w-4 text-gray-600 mr-2" />
              <span className="font-medium">{language === 'en' ? 'EN' : 'RU'}</span>
            </button>
            
            {creditInfo && (
              <div className="mr-4">
                {renderCreditInfo()}
              </div>
            )}
            
            {user && (
              <div className="flex items-center mr-4">
                {renderUserInfo()}
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut size={16} />}
              onClick={handleLogout}
              className="hover:!bg-gray-200"
            >
              {t('navbar.logout')}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-3 space-y-3">
            {user && (
              <div className="py-2 border-b border-gray-200">
                {renderUserInfo()}
              </div>
            )}
            
            <button
              onClick={toggleLanguage}
              className="flex items-center w-full px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              <Globe className="h-4 w-4 text-gray-600 mr-2" />
              <span className="font-medium">
                {language === 'en' ? 'English' : 'Русский'}
              </span>
            </button>
            
            {creditInfo && (
              <div className="py-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {t('navbar.credit_info')}:
                </div>
                <div className="bg-blue-50 rounded-md p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span>{t('navbar.subscription_type')}:</span>
                    <span className="font-medium">{creditInfo.subscriptionType.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>{t('navbar.total_used')}:</span>
                    <span className="font-medium">{creditInfo.totalUsed}</span>
                  </div>
                  <div className="flex justify-between mb-1">
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
            
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<LogOut size={16} />}
                onClick={handleLogout}
                className="w-full hover:!bg-gray-200"
              >
                {t('navbar.logout')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;