import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Search, Filter, PlusCircle, ImageIcon, FileText, Trash2, Edit, SortAsc, SortDesc, Calendar, Copy } from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { useLanguage } from '../../contexts/LanguageContext';
import { Draft, getDrafts, deleteDraft } from '../../services/api';
import { useContentStore } from '../../store/contentStore';
import { useTabContentStore } from '../../store/tabContentStore';
import ConfirmDialog from '../ui/ConfirmDialog';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import DraftEditor from './DraftEditor';
import Input from '../ui/Input';

type Filter = 'all' | 'with-images' | 'text-only';
type SortOption = 'newest' | 'oldest' | 'alphabetical';

// Функция для удаления HTML-тегов из текста
const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

const DraftsPanel = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [filteredDrafts, setFilteredDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showDraftEditor, setShowDraftEditor] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<Draft | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const { setContent } = useContentStore();
  const { t, language } = useLanguage();
  const { savePostState } = useTabContentStore();

  // Load drafts on component mount
  useEffect(() => {
    fetchDrafts();
  }, []);

  // Filter and sort drafts when drafts list, search term, filter, or sort option changes
  useEffect(() => {
    filterAndSortDrafts();
  }, [drafts, searchTerm, activeFilter, sortBy]);

  const fetchDrafts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const draftsList = await getDrafts();
      // Convert string dates to Date objects
      const draftsWithDates = draftsList.map(draft => ({
        ...draft,
        createdAt: new Date(draft.createdAt),
        updatedAt: new Date(draft.updatedAt)
      }));
      setDrafts(draftsWithDates);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError(t('drafts.error_loading'));
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortDrafts = () => {
    let result = [...drafts];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        draft => 
          draft.title.toLowerCase().includes(term) || 
          draft.content.toLowerCase().includes(term) ||
          (draft.tags && draft.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    }

    // Apply type filter
    if (activeFilter === 'with-images') {
      result = result.filter(
        draft => draft.imageUrl || (draft.imageUrls && draft.imageUrls.length > 0)
      );
    } else if (activeFilter === 'text-only') {
      result = result.filter(
        draft => !draft.imageUrl && (!draft.imageUrls || draft.imageUrls.length === 0)
      );
    }

    // Apply sorting
    result = result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    setFilteredDrafts(result);
  };

  const handleCreateDraft = () => {
    setSelectedDraft(null);
    setShowDraftEditor(true);
  };

  const handleEditDraft = (draft: Draft) => {
    setSelectedDraft(draft);
    setShowDraftEditor(true);
  };

  const handleDeleteClick = (draft: Draft) => {
    setDraftToDelete(draft);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!draftToDelete) return;
    
    try {
      await deleteDraft(draftToDelete._id);
      setDrafts(drafts.filter(d => d._id !== draftToDelete._id));
      setNotification({
        type: 'success',
        message: t('drafts.delete_success')
      });
    } catch (err) {
      console.error('Error deleting draft:', err);
      setNotification({
        type: 'error',
        message: t('drafts.error_delete')
      });
    } finally {
      setShowDeleteConfirm(false);
      setDraftToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDraftToDelete(null);
  };

  const handleCopyToPost = (draft: Draft) => {
    // Сначала обновляем contentStore
    setContent({
      text: draft.content,
      imageUrl: draft.imageUrl || '',
      imageUrls: draft.imageUrls || [],
      tags: draft.tags || [],
      imagePosition: draft.imagePosition || 'top',
      buttons: draft.buttons || []
    });
    
    // Затем обновляем tabContentStore для сохранения в localStorage
    savePostState({
      text: draft.content,
      imageUrl: draft.imageUrl || '',
      imageUrls: draft.imageUrls || [],
      tags: draft.tags || [],
      selectedChannelIds: [], // Сбрасываем выбранные каналы при копировании
      scheduleType: 'now',    // Сбрасываем тип расписания
      scheduledDate: null,    // Сбрасываем дату расписания
      useMultipleImages: draft.imageUrls && draft.imageUrls.length > 0, // Устанавливаем режим в зависимости от наличия изображений
      imagePosition: draft.imagePosition || 'top',
      buttons: draft.buttons || []
    });
    
    // Отладка для проверки
    console.log('Копируем в пост с позицией изображения:', draft.imagePosition);
    console.log('Сохраняем в localStorage:', {
      imagePosition: draft.imagePosition || 'top',
      buttons: draft.buttons || []
    });
    
    setNotification({
      type: 'success',
      message: t('drafts.copied_to_editor')
    });
  };

  const handleDraftSaved = (savedDraft: Draft) => {
    if (selectedDraft) {
      // Updating existing draft
      setDrafts(drafts.map(d => d._id === savedDraft._id ? savedDraft : d));
      setNotification({
        type: 'success',
        message: t('drafts.update_success')
      });
    } else {
      // Adding new draft
      setDrafts([...drafts, savedDraft]);
      setNotification({
        type: 'success',
        message: t('drafts.create_success')
      });
    }
    setShowDraftEditor(false);
  };

  const formatDate = (date: Date) => {
    const locale = language === 'ru' ? ru : enUS;
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'media-group':
        return '📸';
      default:
        return '📝';
    }
  };

  const getTypeName = (type?: string) => {
    switch (type) {
      case 'image':
        return 'Изображение';
      case 'video':
        return 'Видео';
      case 'media-group':
        return 'Медиа-группа';
      default:
        return 'Текст';
    }
  };

  if (showDraftEditor) {
    return (
      <DraftEditor 
        draft={selectedDraft}
        onSave={handleDraftSaved}
        onCancel={() => setShowDraftEditor(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t('drafts.title') || 'Черновики'}</CardTitle>
          <p className="text-sm text-gray-500 mt-1">{t('drafts.subtitle') || 'Управляйте сохраненными черновиками ваших постов'}</p>
        </div>
        <Button 
          onClick={handleCreateDraft}
          className="shrink-0"
          leftIcon={<PlusCircle size={16} />}
        >
          {t('drafts.create_new') || 'Создать черновик'}
        </Button>
      </CardHeader>
      <CardContent>
        {notification && (
          <Alert
            variant={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Search and filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={t('drafts.search') || 'Поиск черновиков...'}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                className={`px-3 py-2 text-sm border rounded-l-md ${
                  activeFilter === 'all'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setActiveFilter('all')}
              >
                {t('drafts.filter_all')}
              </button>
              <button
                className={`px-3 py-2 text-sm border-t border-b border-r ${
                  activeFilter === 'with-images'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setActiveFilter('with-images')}
              >
                <ImageIcon size={14} className="inline mr-1" />
                {t('drafts.filter_with_images')}
              </button>
              <button
                className={`px-3 py-2 text-sm border-t border-b border-r rounded-r-md ${
                  activeFilter === 'text-only'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setActiveFilter('text-only')}
              >
                <FileText size={14} className="inline mr-1" />
                {t('drafts.filter_text_only')}
              </button>
            </div>
            
            <div className="inline-flex rounded-md shadow-sm">
              <button
                className={`px-3 py-2 text-sm border rounded-l-md ${
                  sortBy === 'newest'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSortBy('newest')}
              >
                <SortDesc size={14} className="inline mr-1" />
                {t('drafts.sort_newest')}
              </button>
              <button
                className={`px-3 py-2 text-sm border-t border-b border-r ${
                  sortBy === 'oldest'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSortBy('oldest')}
              >
                <SortAsc size={14} className="inline mr-1" />
                {t('drafts.sort_oldest')}
              </button>
              <button
                className={`px-3 py-2 text-sm border-t border-b border-r rounded-r-md ${
                  sortBy === 'alphabetical'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSortBy('alphabetical')}
              >
                <Filter size={14} className="inline mr-1" />
                {t('drafts.sort_alphabetical')}
              </button>
            </div>
          </div>
        </div>

        {/* Drafts list */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Alert variant="error" message={error} />
        ) : filteredDrafts.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
            <FileText className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">{t('drafts.no_drafts') || 'Нет черновиков'}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('drafts.create_new') || 'Создайте первый черновик для быстрого доступа к часто используемому контенту'}</p>
            <div className="mt-6">
              <Button onClick={handleCreateDraft} leftIcon={<PlusCircle size={16} />}>
                {t('drafts.create_new') || 'Создать черновик'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDrafts.map((draft) => (
              <div 
                key={draft._id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getTypeIcon(draft.type)}</span>
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {draft.title}
                      </h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {getTypeName(draft.type)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {stripHtml(draft.content)}
                    </p>
                    
                    {draft.tags && draft.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {draft.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        Создан: {formatDate(draft.createdAt)}
                      </span>
                      {draft.updatedAt.getTime() !== draft.createdAt.getTime() && (
                        <span>
                          Изменен: {formatDate(draft.updatedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {draft.imageUrl && (
                    <div className="flex-shrink-0 ml-4">
                      <img 
                        src={draft.imageUrl} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded border border-gray-200" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                    leftIcon={<Copy size={14} />}
                    onClick={() => handleCopyToPost(draft)}
                  >
                    Копировать в редактор
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    leftIcon={<Edit size={14} />}
                    onClick={() => handleEditDraft(draft)}
                  >
                    Редактировать
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    leftIcon={<Trash2 size={14} />}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    onClick={() => handleDeleteClick(draft)}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title={t('drafts.confirm_delete')}
        message={t('drafts.confirm_delete_description')}
        confirmText={t('drafts.delete')}
        cancelText={t('drafts.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmType="danger"
      />
    </Card>
  );
};

export default DraftsPanel; 