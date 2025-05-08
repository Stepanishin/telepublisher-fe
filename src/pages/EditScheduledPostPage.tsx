import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import PublishPanel from '../components/Dashboard/PublishPanel';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { getScheduledPost, deleteScheduledPost } from '../services/api';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useContentStore } from '../store/contentStore';

interface ScheduledPostData {
  _id: string;
  text: string;
  imageUrl?: string;
  imageUrls?: string[];
  channelId: string;
  scheduledDate: string;
  tags: string[];
}

const EditScheduledPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setContent } = useContentStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [post, setPost] = useState<ScheduledPostData | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await getScheduledPost(id);
        if (response.success && response.post) {
          setPost(response.post);
          
          // Initialize content store with post data
          setContent({
            text: response.post.text,
            imageUrl: response.post.imageUrl || '',
            imageUrls: response.post.imageUrls || [],
            tags: response.post.tags || []
          });
        } else {
          setError(t('scheduled_posts.error_fetch_single'));
        }
      } catch (err) {
        console.error('Failed to fetch scheduled post:', err);
        setError(t('scheduled_posts.error_fetch_single'));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, setContent, t]);

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm(t('scheduled_posts.confirm_delete'))) {
      try {
        await deleteScheduledPost(id);
        navigate('/dashboard', { state: { 
          tab: 'scheduled', 
          notification: { 
            type: 'success', 
            message: t('scheduled_posts.delete_success') 
          }
        }});
      } catch (err) {
        console.error('Failed to delete scheduled post:', err);
        setDeleteError(t('scheduled_posts.error_delete'));
      }
    }
  };

  const handleBack = () => {
    navigate('/dashboard', { state: { tab: 'scheduled' } });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('scheduled_posts.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert 
          variant="error" 
          message={error} 
          onClose={() => setError(null)}
        />
        <div className="mt-4">
          <Button onClick={handleBack} leftIcon={<ArrowLeft size={16} />}>
            {t('scheduled_posts.back_to_list')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('scheduled_posts.edit_title')}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {t('scheduled_posts.scheduled_for')}: {new Date(post?.scheduledDate || '').toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleBack}
              leftIcon={<ArrowLeft size={16} />}
            >
              {t('scheduled_posts.back')}
            </Button>
            <Button 
              variant="outline" 
              className="text-red-500 border-red-500 hover:bg-red-50"
              onClick={handleDelete}
              leftIcon={<Trash2 size={16} />}
            >
              {t('scheduled_posts.delete')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {deleteError && (
            <Alert 
              variant="error" 
              message={deleteError} 
              onClose={() => setDeleteError(null)}
            />
          )}
          
          {post && (
            <PublishPanel 
              editMode={true}
              scheduledPostId={id}
              initialChannelId={post.channelId}
              initialScheduledDate={new Date(post.scheduledDate)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditScheduledPostPage; 