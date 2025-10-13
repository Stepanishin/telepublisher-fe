import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DashboardContentPage from './pages/DashboardContentPage';
import DashboardChannelsPage from './pages/DashboardChannelsPage';
import DashboardInstructionsPage from './pages/DashboardInstructionsPage';
import DashboardSubscriptionPage from './pages/DashboardSubscriptionPage';
import DashboardScheduledPage from './pages/DashboardScheduledPage';
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
  const { isAuthenticated, isLoading } = useUserStore();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
              
              {/* Dashboard routes with nested tabs */}
              <Route 
                path="dashboard" 
                element={
                  isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />
                }
              >
                {/* Redirect /dashboard to /dashboard/content */}
                <Route index element={<Navigate to="/dashboard/content" replace />} />
                
                {/* Dashboard tab pages */}
                <Route path="content" element={<DashboardContentPage />} />
                <Route path="channels" element={<DashboardChannelsPage />} />
                <Route path="instructions" element={<DashboardInstructionsPage />} />
                <Route path="subscription" element={<DashboardSubscriptionPage />} />
                <Route path="scheduled" element={<DashboardScheduledPage />} />
                
                {/* Content creation routes - nested within dashboard to maintain tab navigation */}
                <Route path="content/post" element={<PostTypeSelector />} />
                <Route path="content/create-text" element={<CreateTextPostPage />} />
                <Route path="content/create-image" element={<CreateImagePostPage />} />
                {/* <Route path="content/create-video" element={<CreateVideoPostPage />} /> */}
                <Route path="content/create-media-group" element={<CreateMediaGroupPage />} />
                <Route path="content/poll" element={<PollPage />} />
                <Route path="content/autoposting" element={<AutoPostingPage />} />
                <Route path="content/drafts" element={<DraftsPage />} />
                <Route path="edit-scheduled-post/:id" element={<EditScheduledPostPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </LanguageProvider>
  );
}

export default App;