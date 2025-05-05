import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <h1 className="text-6xl font-bold text-gray-900 mb-6">404</h1>
      <p className="text-xl text-gray-700 mb-8 text-center">
        Страница не найдена
      </p>
      <Link to="/">
        <Button size="lg">Вернуться на главную</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;