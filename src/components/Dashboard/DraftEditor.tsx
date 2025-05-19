import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowLeft, Save, EyeIcon, Edit2 } from 'lucide-react';
import { Draft, createDraft, updateDraft } from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageUploader from '../ui/ImageUploader';
import MultipleImageUploader from '../ui/MultipleImageUploader';
import TagInput from '../ui/TagInput';
import TelegramPostPreview from '../ui/TelegramPostPreview';

interface DraftEditorProps {
  draft: Draft | null;
  onSave: (draft: Draft) => void;
  onCancel: () => void;
}

const DraftEditor: React.FC<DraftEditorProps> = ({ draft, onSave, onCancel }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [useMultipleImages, setUseMultipleImages] = useState<boolean | undefined>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  // Define Quill modules and formats
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'bold', 'italic', 'underline', 'strike', 
    'list', 'bullet', 'link'
  ];

  // Initialize form with draft data if editing
  useEffect(() => {
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
      setImageUrl(draft.imageUrl || '');
      setImageUrls(draft.imageUrls || []);
      setTags(draft.tags || []);
      setUseMultipleImages(draft.imageUrls && draft.imageUrls.length > 0);
    }
  }, [draft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      setError(t('drafts.title_required'));
      return;
    }
    
    if (!content.trim()) {
      setError(t('drafts.content_required'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const draftData = {
        title,
        content,
        imageUrl: useMultipleImages ? '' : imageUrl,
        imageUrls: useMultipleImages ? imageUrls : [],
        tags
      };
      
      let savedDraft;
      
      if (draft) {
        // Update existing draft
        savedDraft = await updateDraft(draft._id, draftData);
      } else {
        // Create new draft
        savedDraft = await createDraft(draftData);
      }
      
      onSave(savedDraft);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(draft ? t('drafts.error_update') : t('drafts.error_create'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleImageMode = () => {
    setUseMultipleImages(!useMultipleImages);
    
    // When switching to single image mode, use the first image from multiple images if available
    if (useMultipleImages && imageUrls.length > 0) {
      setImageUrl(imageUrls[0]);
    }
    
    // When switching to multiple images mode, add the current single image if available
    if (!useMultipleImages && imageUrl) {
      setImageUrls([imageUrl]);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{draft ? t('drafts.editor_title') + ': ' + draft.title : t('drafts.editor_title')}</CardTitle>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
            leftIcon={viewMode === 'editor' ? <EyeIcon size={16} /> : <Edit2 size={16} />}
          >
            {viewMode === 'editor' ? t('drafts.preview') : t('drafts.editor')}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            leftIcon={<ArrowLeft size={16} />}
          >
            {t('drafts.cancel')}
          </Button>
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
        
        {viewMode === 'editor' ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('drafts.editor_title')}
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('drafts.editor_title_placeholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('publish_panel.text_label')}
                </label>
                <div className="quill-container">
                  <ReactQuill
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder={t('drafts.editor_content_placeholder')}
                    theme="snow"
                  />
                </div>
                <div style={{ height: '40px' }}></div> {/* Spacer to compensate for the Quill toolbar */}
              </div>
              
              {/* Toggle between single and multiple image modes */}
              <div className="mb-4">
                <div className="flex items-center justify-end mb-2">
                  <label className="text-sm text-gray-600 mr-2 flex items-center">
                    {t('publish_panel.multiple_images')}
                  </label>
                  <div 
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                      useMultipleImages ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={toggleImageMode}
                  >
                    <div 
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        useMultipleImages ? 'translate-x-5' : 'translate-x-0'
                      }`} 
                    />
                  </div>
                </div>
                
                {!useMultipleImages ? (
                  <ImageUploader
                    value={imageUrl}
                    onChange={setImageUrl}
                    onError={setUploadError}
                  />
                ) : (
                  <MultipleImageUploader
                    values={imageUrls}
                    onChange={setImageUrls}
                    onError={setUploadError}
                    maxImages={10}
                  />
                )}
                
                {uploadError && (
                  <Alert
                    variant="error"
                    message={uploadError}
                    onClose={() => setUploadError('')}
                  />
                )}
              </div>
              
              <TagInput
                label={t('publish_panel.tags')}
                tags={tags}
                onChange={setTags}
              />
            </div>
          </form>
        ) : (
          <div>
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <TelegramPostPreview
              text={content}
              imageUrl={useMultipleImages ? '' : imageUrl}
              imageUrls={useMultipleImages ? imageUrls : []}
              tags={tags}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-4">
        <Button 
          variant="outline"
          onClick={onCancel}
        >
          {t('drafts.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading || !title.trim() || !content.trim()}
          leftIcon={<Save size={16} />}
        >
          {t('drafts.save')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DraftEditor; 