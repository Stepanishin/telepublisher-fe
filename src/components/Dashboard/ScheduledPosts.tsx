import React, { useState, useEffect } from 'react';
import { Calendar, Edit, Trash2, Image as ImageIcon, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/dateUtils';
import { useChannelsStore } from '../../store/channelsStore';
import { getScheduledPosts, deleteScheduledPost, publishScheduledPost } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface ScheduledPost {
  _id: string;
  text: string;
  imageUrl?: string;
  imageUrls?: string[];
  channelId: string;
  scheduledDate: string;
  tags: string[];
}

const ScheduledPosts: React.FC = () => {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [postToPublish, setPostToPublish] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const { t } = useLanguage();
  const { channels } = useChannelsStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const response = await getScheduledPosts();
      setPosts(response.posts || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch scheduled posts:', err);
      setError(t('scheduled_posts.error_fetch'));
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const openPublishDialog = (postId: string) => {
    setPostToPublish(postId);
    setPublishDialogOpen(true);
  };

  const closePublishDialog = () => {
    setPublishDialogOpen(false);
    setPostToPublish(null);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    
    try {
      await deleteScheduledPost(postToDelete);
      setPosts(posts.filter(post => post._id !== postToDelete));
      setDeleteSuccess(t('scheduled_posts.delete_success'));
      setDeleteError(null);
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to delete scheduled post:', err);
      setDeleteError(t('scheduled_posts.error_delete'));
      setTimeout(() => setDeleteError(null), 3000);
    } finally {
      closeDeleteDialog();
    }
  };

  const handlePublishNow = async () => {
    if (!postToPublish) return;
    
    try {
      setLoading(true);
      await publishScheduledPost(postToPublish);
      setPosts(posts.filter(post => post._id !== postToPublish));
      setPublishSuccess(t('scheduled_posts.publish_success'));
      setPublishError(null);
      setTimeout(() => setPublishSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to publish post:', err);
      setPublishError(t('scheduled_posts.error_publish'));
      setTimeout(() => setPublishError(null), 3000);
    } finally {
      setLoading(false);
      closePublishDialog();
    }
  };

  const handleEdit = (postId: string) => {
    navigate(`/edit-scheduled-post/${postId}`);
  };

  const getChannelName = (channelId: string) => {
    const channel = channels.find(c => c._id === channelId || c.id === channelId);
    return channel ? channel.title : channelId;
  };

  const renderPostContent = (post: ScheduledPost) => {
    // Truncate text to a reasonable length
    const maxLength = 100;
    const displayText = post.text.length > maxLength
      ? `${post.text.substring(0, maxLength)}...`
      : post.text;

    return displayText;
  };

  const renderPostType = (post: ScheduledPost) => {
    if (post.imageUrls && post.imageUrls.length > 1) {
      return (
        <span className="flex items-center">
          <ImageIcon size={16} className="mr-1" />
          {t('scheduled_posts.album')} ({post.imageUrls.length})
        </span>
      );
    } else if (post.imageUrl || (post.imageUrls && post.imageUrls.length === 1)) {
      return (
        <span className="flex items-center">
          <ImageIcon size={16} className="mr-1" />
          {t('scheduled_posts.image')}
        </span>
      );
    } else {
      return t('scheduled_posts.text_only');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('scheduled_posts.title')}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert 
            variant="error" 
            message={error} 
            onClose={() => setError(null)}
          />
        )}

        {deleteError && (
          <Alert 
            variant="error" 
            message={deleteError} 
            onClose={() => setDeleteError(null)}
          />
        )}

        {deleteSuccess && (
          <Alert 
            variant="success" 
            message={deleteSuccess} 
            onClose={() => setDeleteSuccess(null)}
          />
        )}

        {publishError && (
          <Alert 
            variant="error" 
            message={publishError} 
            onClose={() => setPublishError(null)}
          />
        )}

        {publishSuccess && (
          <Alert 
            variant="success" 
            message={publishSuccess} 
            onClose={() => setPublishSuccess(null)}
          />
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">{t('scheduled_posts.loading')}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">{t('scheduled_posts.no_posts')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('scheduled_posts.date')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('scheduled_posts.channel')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('scheduled_posts.content')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('scheduled_posts.type')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('scheduled_posts.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map(post => (
                  <tr key={post._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-blue-500" />
                        {formatDate(new Date(post.scheduledDate))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getChannelName(post.channelId)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {renderPostContent(post)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderPostType(post)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(post._id)}
                          className="p-1"
                          title={t('scheduled_posts.edit')}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-1 text-blue-500 border-blue-500 hover:bg-blue-50"
                          onClick={() => openPublishDialog(post._id)}
                          title={t('scheduled_posts.publish_now')}
                        >
                          <Send size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-1 text-red-500 border-red-500 hover:bg-red-50"
                          onClick={() => openDeleteDialog(post._id)}
                          title={t('scheduled_posts.delete')}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      
      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title={t('scheduled_posts.delete')}
        message={t('scheduled_posts.confirm_delete')}
        confirmText={t('scheduled_posts.delete')}
        cancelText={t('common.close')}
        confirmType="danger"
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />
      
      <ConfirmDialog
        isOpen={publishDialogOpen}
        title={t('scheduled_posts.publish_now')}
        message={t('scheduled_posts.confirm_publish_now')}
        confirmText={t('scheduled_posts.publish_now')}
        cancelText={t('common.close')}
        confirmType="primary"
        onConfirm={handlePublishNow}
        onCancel={closePublishDialog}
      />
    </Card>
  );
};

export default ScheduledPosts; 