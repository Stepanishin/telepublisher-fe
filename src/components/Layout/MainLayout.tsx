import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useUserStore } from '../../store/userStore';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only restrict access to the dashboard route
    if (!isAuthenticated && location.pathname === '/dashboard') {
      navigate('/login');
    }
    
    // Redirect to dashboard if authenticated and on login page
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, location.pathname]);

  const isHomePage = location.pathname === '/';
  const showAuthNavbar = isAuthenticated && !isHomePage;

  return (
    <div className="min-h-screen bg-gray-50">
      {showAuthNavbar && <Navbar />}
      <main className={isHomePage ? 'w-full' : 'container mx-auto py-6 px-4 sm:px-6 lg:px-8'}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;