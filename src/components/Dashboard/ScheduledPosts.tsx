import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Edit, Trash2, Image as ImageIcon, Send, BarChart2, List, Grid } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/dateUtils';
import { useChannelsStore } from '../../store/channelsStore';
import { 
  getScheduledPosts, 
  deleteScheduledPost, 
  publishScheduledPost,
  getScheduledPolls,
  deleteScheduledPoll,
  publishScheduledPoll
} from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, ru as ruRU } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface ScheduledPost {
  _id: string;
  text: string;
  imageUrl?: string;
  imageUrls?: string[];
  channelId: string;
  scheduledDate: string;
  tags: string[];
  type?: 'post';
}

interface ScheduledPoll {
  _id: string;
  question: string;
  options: string[];
  channelId: string;
  scheduledDate: string;
  isAnonymous: boolean;
  allowsMultipleAnswers: boolean;
  type?: 'poll';
}

type ScheduledItem = ScheduledPost | ScheduledPoll;

// Type guard to check if an item is a ScheduledPoll
const isPoll = (item: ScheduledItem): item is ScheduledPoll => {
  return 'question' in item && 'options' in item;
};

type ViewMode = 'list' | 'calendar';

// Define a custom event type that extends the base Event from react-big-calendar
interface CalendarEvent extends Event {
  id: string;
  resource?: ScheduledItem;
}

const ScheduledPosts: React.FC = () => {
  const [items, setItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'post' | 'poll'} | null>(null);
  const [itemToPublish, setItemToPublish] = useState<{id: string, type: 'post' | 'poll'} | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar'); // Default to calendar view
  const [selectedEvent, setSelectedEvent] = useState<ScheduledItem | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const { t, language } = useLanguage();
  const { channels } = useChannelsStore();
  const navigate = useNavigate();

  // Calendar localization setup
  const locales = {
    'en': enUS,
    'ru': ruRU
  };
  
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
  });

  useEffect(() => {
    fetchScheduledItems();
  }, []);

  const fetchScheduledItems = async () => {
    try {
      setLoading(true);
      // Load both posts and polls
      const [postsResponse, pollsResponse] = await Promise.all([
        getScheduledPosts(),
        getScheduledPolls()
      ]);
      
      // Mark each item with its type
      const posts = (postsResponse.posts || []).map((post: ScheduledPost) => ({
        ...post,
        type: 'post' as const
      }));
      
      const polls = (pollsResponse.polls || []).map((poll: ScheduledPoll) => ({
        ...poll,
        type: 'poll' as const
      }));
      
      // Combine and sort by scheduledDate
      const combinedItems = [...posts, ...polls].sort((a, b) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
      
      setItems(combinedItems);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch scheduled items:', err);
      setError(t('scheduled_posts.error_fetch'));
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (id: string, type: 'post' | 'poll') => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const openPublishDialog = (id: string, type: 'post' | 'poll') => {
    setItemToPublish({ id, type });
    setPublishDialogOpen(true);
  };

  const closePublishDialog = () => {
    setPublishDialogOpen(false);
    setItemToPublish(null);
  };
  
  const openEventDetails = (item: ScheduledItem) => {
    setSelectedEvent(item);
    setEventDetailsOpen(true);
  };
  
  const closeEventDetails = () => {
    setEventDetailsOpen(false);
    setSelectedEvent(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'post') {
        await deleteScheduledPost(itemToDelete.id);
      } else {
        await deleteScheduledPoll(itemToDelete.id);
      }
      
      setItems(items.filter(item => item._id !== itemToDelete.id));
      setDeleteSuccess(t('scheduled_posts.delete_success'));
      setDeleteError(null);
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to delete scheduled item:', err);
      setDeleteError(t('scheduled_posts.error_delete'));
      setTimeout(() => setDeleteError(null), 3000);
    } finally {
      closeDeleteDialog();
    }
  };

  const handlePublishNow = async () => {
    if (!itemToPublish) return;
    
    try {
      setLoading(true);
      if (itemToPublish.type === 'post') {
        await publishScheduledPost(itemToPublish.id);
      } else {
        await publishScheduledPoll(itemToPublish.id);
      }
      
      setItems(items.filter(item => item._id !== itemToPublish.id));
      setPublishSuccess(t('scheduled_posts.publish_success'));
      setPublishError(null);
      setTimeout(() => setPublishSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to publish item:', err);
      setPublishError(t('scheduled_posts.error_publish'));
      setTimeout(() => setPublishError(null), 3000);
    } finally {
      setLoading(false);
      closePublishDialog();
    }
  };

  const handleEdit = (item: ScheduledItem) => {
    if (isPoll(item)) {
      // TODO: Implement edit for polls when available
      alert(t('scheduled_posts.poll_edit_not_available'));
    } else {
      navigate(`/edit-scheduled-post/${item._id}`);
    }
  };

  const getChannelName = (channelId: string) => {
    const channel = channels.find(c => c._id === channelId || c.id === channelId);
    return channel ? channel.title : channelId;
  };

  const renderItemContent = (item: ScheduledItem) => {
    // For polls, show the question
    if (isPoll(item)) {
      const maxLength = 100;
      const displayText = item.question.length > maxLength
        ? `${item.question.substring(0, maxLength)}...`
        : item.question;
      return displayText;
    }
    
    // For posts, show the text
    const maxLength = 100;
    const displayText = item.text.length > maxLength
      ? `${item.text.substring(0, maxLength)}...`
      : item.text;

    return displayText;
  };

  const renderItemType = (item: ScheduledItem) => {
    if (isPoll(item)) {
      return (
        <span className="flex items-center">
          <BarChart2 size={16} className="mr-1" />
          {t('scheduled_posts.poll')} ({item.options.length})
        </span>
      );
    }
    
    if (item.imageUrls && item.imageUrls.length > 1) {
      return (
        <span className="flex items-center">
          <ImageIcon size={16} className="mr-1" />
          {t('scheduled_posts.album')} ({item.imageUrls.length})
        </span>
      );
    } else if (item.imageUrl || (item.imageUrls && item.imageUrls.length === 1)) {
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
  
  // Convert scheduled items to calendar events
  const calendarEvents: CalendarEvent[] = items.map(item => {
    const eventDate = new Date(item.scheduledDate);
    const title = isPoll(item) 
      ? `${t('scheduled_posts.poll')}: ${item.question.substring(0, 30)}${item.question.length > 30 ? '...' : ''}`
      : `${getChannelName(item.channelId)}: ${item.text.substring(0, 30)}${item.text.length > 30 ? '...' : ''}`;
    
    return {
      id: item._id,
      title,
      start: eventDate,
      end: new Date(eventDate.getTime() + 30 * 60000), // End 30 minutes after start
      resource: item, // Store the full item as a resource for access during event click
      allDay: false
    };
  });
  
  // Handle calendar event selection
  const handleEventSelect = (event: CalendarEvent) => {
    if (event.resource) {
      openEventDetails(event.resource);
    }
  };

  // Render the list view
  const renderListView = () => (
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
          {items.map(item => (
            <tr key={item._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <CalendarIcon size={16} className="mr-2 text-blue-500" />
                  {formatDate(new Date(item.scheduledDate))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getChannelName(item.channelId)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 line-clamp-2">
                  {renderItemContent(item)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderItemType(item)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="p-1"
                    title={t('scheduled_posts.edit')}
                    disabled={isPoll(item)} // Disable for polls until edit functionality is implemented
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-1 text-blue-500 border-blue-500 hover:bg-blue-50"
                    onClick={() => openPublishDialog(item._id, isPoll(item) ? 'poll' : 'post')}
                    title={t('scheduled_posts.publish_now')}
                  >
                    <Send size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-1 text-red-500 border-red-500 hover:bg-red-50"
                    onClick={() => openDeleteDialog(item._id, isPoll(item) ? 'poll' : 'post')}
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
  );
  
  // Render calendar view
  const renderCalendarView = () => (
    <div className="h-[600px] mt-4">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleEventSelect}
        views={['month', 'week', 'day']}
        defaultView="month"
        messages={{
          today: t('calendar.today'),
          previous: t('calendar.previous'),
          next: t('calendar.next'),
          month: t('calendar.month'),
          week: t('calendar.week'),
          day: t('calendar.day'),
          agenda: t('calendar.agenda'),
          date: t('calendar.date'),
          time: t('calendar.time'),
          event: t('calendar.event'),
          noEventsInRange: t('calendar.no_events')
        }}
        culture={language === 'ru' ? 'ru' : 'en'}
        eventPropGetter={(event: CalendarEvent) => {
          const resource = event.resource as ScheduledItem;
          if (!resource) return {};
          
          let backgroundColor = '#3b82f6'; // Default blue
          
          // Different color for different types
          if (isPoll(resource)) {
            backgroundColor = '#8b5cf6'; // Purple for polls
          } else if (resource.imageUrl || (resource.imageUrls && resource.imageUrls.length > 0)) {
            backgroundColor = '#10b981'; // Green for posts with images
          }
          
          return {
            style: {
              backgroundColor,
              borderRadius: '4px',
              opacity: 0.9,
              color: 'white',
              border: '0px',
              display: 'block'
            }
          };
        }}
      />
    </div>
  );
  
  // Event details modal for calendar view
  const renderEventDetails = () => {
    if (!selectedEvent) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-30 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium leading-6">
                {isPoll(selectedEvent) ? t('scheduled_posts.poll_details') : t('scheduled_posts.post_details')}
              </h3>
              <button 
                onClick={closeEventDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">{t('scheduled_posts.date')}</p>
                <p className="font-medium">{formatDate(new Date(selectedEvent.scheduledDate))}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">{t('scheduled_posts.channel')}</p>
                <p className="font-medium">{getChannelName(selectedEvent.channelId)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">{t('scheduled_posts.type')}</p>
                <p className="font-medium flex items-center">
                  {renderItemType(selectedEvent)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">
                  {isPoll(selectedEvent) ? t('scheduled_posts.question') : t('scheduled_posts.content')}
                </p>
                <div className="max-h-40 overflow-y-auto mt-2 p-2 bg-gray-50 rounded">
                  <p>{renderItemContent(selectedEvent)}</p>
                </div>
              </div>
              
              {isPoll(selectedEvent) && (
                <div>
                  <p className="text-sm text-gray-500">{t('scheduled_posts.options')}</p>
                  <ul className="list-disc pl-5">
                    {selectedEvent.options.map((option, idx) => (
                      <li key={idx} className="text-sm">{option}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex space-x-3 justify-end">
              {!isPoll(selectedEvent) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    closeEventDetails();
                    handleEdit(selectedEvent);
                  }}
                >
                  <Edit size={16} className="mr-2" />
                  {t('scheduled_posts.edit')}
                </Button>
              )}
              
              <Button
                variant="outline" 
                size="sm"
                className="text-blue-500 border-blue-500 hover:bg-blue-50"
                onClick={() => {
                  closeEventDetails();
                  openPublishDialog(selectedEvent._id, isPoll(selectedEvent) ? 'poll' : 'post');
                }}
              >
                <Send size={16} className="mr-2" />
                {t('scheduled_posts.publish_now')}
              </Button>
              
              <Button
                variant="outline" 
                size="sm"
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => {
                  closeEventDetails();
                  openDeleteDialog(selectedEvent._id, isPoll(selectedEvent) ? 'poll' : 'post');
                }}
              >
                <Trash2 size={16} className="mr-2" />
                {t('scheduled_posts.delete')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t('scheduled_posts.title')}</CardTitle>
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? '' : 'hover:bg-gray-200'}
            >
              <Grid size={18} className="mr-1" />
              {t('scheduled_posts.calendar_view')}
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? '' : 'hover:bg-gray-200'}
            >
              <List size={18} className="mr-1" />
              {t('scheduled_posts.list_view')}
            </Button>
          </div>
        </div>
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
        ) : items.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">{t('scheduled_posts.no_posts')}</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? renderListView() : renderCalendarView()}
          </>
        )}
      </CardContent>
      
      {/* Event Details Modal */}
      {eventDetailsOpen && renderEventDetails()}
      
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