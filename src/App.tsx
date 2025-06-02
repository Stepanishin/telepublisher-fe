import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import EditScheduledPostPage from './pages/EditScheduledPostPage';
import PostTypeSelector from './components/Dashboard/PostTypeSelector';
import PollPage from './pages/PollPage';
import AutoPostingPage from './pages/AutoPostingPage';
import DraftsPage from './pages/DraftsPage';
import { useUserStore } from './store/userStore';
import { LanguageProvider } from './contexts/LanguageContext';
import CreateTextPostPage from './pages/CreateTextPostPage';
import CreateImagePostPage from './pages/CreateImagePostPage';
import CreateMediaGroupPage from './pages/CreateMediaGroupPage';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const { isAuthenticated } = useUserStore();

  return (
    <LanguageProvider>
      <NotificationProvider>
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
              {/* Content routes */}
              <Route 
                path="dashboard/content/post" 
                element={
                  isAuthenticated ? <PostTypeSelector /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="dashboard/content/create-text" 
                element={
                  isAuthenticated ? <CreateTextPostPage /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="dashboard/content/create-image" 
                element={
                  isAuthenticated ? <CreateImagePostPage /> : <Navigate to="/login" replace />
                } 
              />
              {/* <Route 
                path="dashboard/content/create-video" 
                element={
                  isAuthenticated ? <CreateVideoPostPage /> : <Navigate to="/login" replace />
                } 
              /> */}
              <Route 
                path="dashboard/content/create-media-group" 
                element={
                  isAuthenticated ? <CreateMediaGroupPage /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="dashboard/content/poll" 
                element={
                  isAuthenticated ? <PollPage /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="dashboard/content/autoposting" 
                element={
                  isAuthenticated ? <AutoPostingPage /> : <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="dashboard/content/drafts" 
                element={
                  isAuthenticated ? <DraftsPage /> : <Navigate to="/login" replace />
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
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;