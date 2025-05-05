import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Send } from 'lucide-react';
import Button from '../ui/Button';
import { useUserStore } from '../../store/userStore';

const Navbar: React.FC = () => {
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    logout();
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
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;