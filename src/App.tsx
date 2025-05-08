import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import EditScheduledPostPage from './pages/EditScheduledPostPage';
import { useUserStore } from './store/userStore';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const { isAuthenticated } = useUserStore();

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route 
              path="dashboard" 
              element={
                isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="edit-scheduled-post/:id" 
              element={
                isAuthenticated ? <EditScheduledPostPage /> : <Navigate to="/login" replace />
              } 
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;