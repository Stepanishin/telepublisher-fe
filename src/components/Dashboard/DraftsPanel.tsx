import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Search, Filter, PlusCircle, ImageIcon, FileText, Trash2, Edit, Copy, SortAsc, SortDesc, ExternalLink } from 'lucide-react';
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
      setDrafts(draftsList);
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
          <CardTitle>{t('drafts.title')}</CardTitle>
          <p className="text-sm text-gray-500 mt-1">{t('drafts.subtitle')}</p>
        </div>
        <Button 
          onClick={handleCreateDraft}
          className="shrink-0"
          leftIcon={<PlusCircle size={16} />}
        >
          {t('drafts.create_new')}
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
            <input
              type="text"
              placeholder={t('drafts.search')}
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
            <h3 className="mt-2 text-lg font-medium text-gray-900">{t('drafts.no_drafts')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('drafts.create_new')}</p>
            <div className="mt-6">
              <Button onClick={handleCreateDraft} leftIcon={<PlusCircle size={16} />}>
                {t('drafts.create_new')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDrafts.map((draft) => (
              <div 
                key={draft._id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {draft.imageUrl && draft.imagePosition !== 'bottom' && (
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={draft.imageUrl} 
                      alt={draft.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!draft.imageUrl && draft.imageUrls && draft.imageUrls.length > 0 && draft.imagePosition !== 'bottom' && (
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={draft.imageUrls[0]} 
                      alt={draft.title} 
                      className="w-full h-full object-cover"
                    />
                    {draft.imageUrls.length > 1 && (
                      <div className="bg-black bg-opacity-70 text-white absolute top-2 right-2 text-xs px-2 py-1 rounded-md">
                        +{draft.imageUrls.length - 1}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{draft.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{stripHtml(draft.content)}</p>
                  
                  {/* Показываем изображение снизу, если указана позиция bottom */}
                  {draft.imagePosition === 'bottom' && draft.imageUrl && (
                    <div className="mb-3 border-t border-gray-100 pt-2">
                      <div className="h-24 overflow-hidden relative rounded-md">
                        <img 
                          src={draft.imageUrl} 
                          alt={draft.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {t('drafts.image_bottom')}
                      </div>
                    </div>
                  )}
                  {draft.imagePosition === 'bottom' && !draft.imageUrl && draft.imageUrls && draft.imageUrls.length > 0 && (
                    <div className="mb-3 border-t border-gray-100 pt-2">
                      <div className="h-24 overflow-hidden relative rounded-md">
                        <img 
                          src={draft.imageUrls[0]} 
                          alt={draft.title} 
                          className="w-full h-full object-cover"
                        />
                        {draft.imageUrls.length > 1 && (
                          <div className="bg-black bg-opacity-70 text-white absolute top-2 right-2 text-xs px-2 py-1 rounded-md">
                            +{draft.imageUrls.length - 1}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {t('drafts.image_bottom')}
                      </div>
                    </div>
                  )}
                  
                  {/* Показываем кнопки, если они есть */}
                  {draft.buttons && draft.buttons.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {draft.buttons.slice(0, 1).map((button, idx) => (
                          <span 
                            key={idx} 
                            className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 flex items-center"
                          >
                            <ExternalLink size={10} className="mr-1" />
                            {button.text}
                          </span>
                        ))}
                        {draft.buttons.length > 1 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            +{draft.buttons.length - 1}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {draft.tags && draft.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {draft.tags.slice(0, 3).map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {draft.tags.length > 3 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          +{draft.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <div>{t('drafts.created_on').replace('{date}', formatDate(draft.createdAt))}</div>
                    <div>{t('drafts.updated_on').replace('{date}', formatDate(draft.updatedAt))}</div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditDraft(draft)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title={t('drafts.edit')}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(draft)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title={t('drafts.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => handleCopyToPost(draft)}
                      className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-xs px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <Copy size={12} />
                      {t('drafts.copy_to_post')}
                    </button>
                  </div>
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