import React from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import Button from '../ui/Button';

const PublicNavbar: React.FC = () => {
  return (
    <nav className="bg-transparent absolute top-0 left-0 right-0 z-10">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Send className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-semibold text-white">
                TelePublisher
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#features" className="text-white hover:text-blue-100">
              Возможности
            </a>
            <a href="#pricing" className="text-white hover:text-blue-100">
              Тарифы
            </a>
            <Link to="/login">
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-blue-700">
                Войти
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar; 