import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowLeft, Save, EyeIcon, Edit2, Plus, Trash, Smile } from 'lucide-react';
import { Draft, createDraft, updateDraft } from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageUploader from '../ui/ImageUploader';
import MultipleImageUploader from '../ui/MultipleImageUploader';
import TagInput from '../ui/TagInput';
import TelegramPostPreview from '../ui/TelegramPostPreview';
import { TelegramButton } from '../../types';
import { commonEmojis } from '../../utils/commonEmojis';

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
  const [imagePosition, setImagePosition] = useState<'top' | 'bottom'>('top');
  const [buttons, setButtons] = useState<TelegramButton[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Add a ref for the Quill editor instance
  const quillRef = useRef<ReactQuill>(null);

  // Helper function to validate URL
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  // Function to insert emoji at cursor position
  const insertEmoji = (emoji: string) => {
    if (!quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    
    if (range) {
      // Insert emoji at cursor position
      quill.insertText(range.index, emoji);
      // Move cursor after the inserted emoji
      quill.setSelection(range.index + emoji.length, 0);
    } else {
      // If no selection, insert at the end
      const length = quill.getText().length;
      quill.insertText(length, emoji);
      quill.setSelection(length + emoji.length, 0);
    }
    
    // Hide emoji picker after selection
    setShowEmojiPicker(false);
  };

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
      setImagePosition(draft.imagePosition || 'top');
      setButtons(draft.buttons || []);
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
        tags,
        imagePosition,
        buttons
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
    // Prevent toggling to multiple images if bottom position is selected
    if (!useMultipleImages && imagePosition === 'bottom') {
      // Notify user this is not allowed
      setUploadError(t('publish_panel.bottom_position_single_image') || 'Bottom position only supports single image');
      return;
    }
    
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

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
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
                    ref={quillRef}
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder={t('drafts.editor_content_placeholder')}
                    theme="snow"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  {/* Emoji picker button */}
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      leftIcon={<Smile size={16} />}
                      className="flex justify-center items-center"
                    >
                    </Button>
                    
                    {/* Emoji picker panel */}
                    {showEmojiPicker && (
                      <div className="absolute top-10 left-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg p-2 max-w-xs max-h-48 overflow-y-auto w-max">
                        <div className="grid grid-cols-8 gap-1">
                          {commonEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              className="w-8 h-8 text-lg hover:bg-gray-100 rounded-md flex items-center justify-center focus:outline-none"
                              onClick={() => insertEmoji(emoji)}
                              type="button"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ height: '40px' }}></div> {/* Spacer to compensate for the Quill toolbar */}
              </div>
              
              {/* Toggle between single and multiple image modes */}
              <div className="mb-4">
                {/* Image position selector - moved above image upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('publish_panel.image_position') || 'Image Position'}
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={imagePosition === 'top'}
                        onChange={() => {
                          setImagePosition('top');
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {t('publish_panel.image_position_top') || 'Top'}
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        checked={imagePosition === 'bottom'}
                        onChange={() => {
                          setImagePosition('bottom');
                          // If switching to bottom position, force single image mode
                          if (useMultipleImages) {
                            setUseMultipleImages(false);
                            if (imageUrls.length > 0) {
                              setImageUrl(imageUrls[0]);
                            }
                          }
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {t('publish_panel.image_position_bottom') || 'Bottom'}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {imagePosition === 'bottom' 
                      ? (t('publish_panel.image_position_bottom_description') || 'Image will be shown as a link preview at the bottom of the message.') 
                      : (t('publish_panel.image_position_top_description') || 'Image will be shown before the text.')}
                  </p>
                  {imagePosition === 'bottom' && (
                    <p className="text-xs text-amber-600 mt-1">
                      {t('publish_panel.bottom_position_single_image') || 'Bottom position only supports single image.'}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-end mb-2">
                  <label className="text-sm text-gray-600 mr-2 flex items-center">
                    {t('publish_panel.multiple_images') || 'Multiple Images'}
                  </label>
                  <div 
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                      useMultipleImages ? 'bg-blue-600' : 'bg-gray-300'
                    } ${imagePosition === 'bottom' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              
              {/* Кнопки для Telegram */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('publish_panel.buttons') || 'Buttons'}
                </label>
                
                {imagePosition === 'top' && (imageUrl || imageUrls.length > 0) ? (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200 mb-3">
                    {t('publish_panel.buttons_not_available_top') || 'Buttons are only available for posts with image at the bottom or text-only posts.'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {buttons.map((button, index) => (
                      <div key={index} className="flex items-start mb-3 space-x-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                        <div className="flex-grow">
                          <label className="block text-xs text-gray-600 mb-1">{t('publish_panel.button_text') || 'Button Text'}</label>
                          <input
                            type="text"
                            placeholder={t('publish_panel.button_text_placeholder') || 'Enter button text'}
                            value={button.text}
                            onChange={(e) => {
                              const newButtons = [...buttons];
                              newButtons[index].text = e.target.value;
                              setButtons(newButtons);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
                          />
                          <label className="block text-xs text-gray-600 mb-1">{t('publish_panel.button_url') || 'Button URL'}</label>
                          <input
                            type="text"
                            placeholder={t('publish_panel.button_url_placeholder') || 'https://...'}
                            value={button.url}
                            onChange={(e) => {
                              const newButtons = [...buttons];
                              newButtons[index].url = e.target.value;
                              setButtons(newButtons);
                            }}
                            className={`w-full p-2 border rounded-md text-sm ${
                              button.url && !isValidUrl(button.url) 
                                ? 'border-red-500' 
                                : 'border-gray-300'
                            }`}
                          />
                          {button.url && !isValidUrl(button.url) && (
                            <p className="text-xs text-red-500 mt-1">
                              {t('publish_panel.invalid_url') || 'Invalid URL format'}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeButton(index)}
                          className="mt-1 p-2 text-red-500 hover:bg-red-50 rounded-md"
                          title={t('publish_panel.remove_button') || 'Remove button'}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add button button */}
                    {buttons.length < 5 && (
                      <button
                        type="button"
                        onClick={() => {
                          setButtons([...buttons, { text: '', url: '' }]);
                        }}
                        className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors flex items-center"
                      >
                        <Plus size={16} className="mr-1" />
                        {t('publish_panel.add_button') || 'Add Button'}
                      </button>
                    )}
                    
                    {buttons.length >= 5 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t('publish_panel.max_buttons') || 'Maximum 5 buttons allowed.'}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {t('publish_panel.buttons_note') || 'Buttons will appear below your post in Telegram.'}
                    </p>
                  </div>
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
              imagePosition={imagePosition}
              buttons={buttons}
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