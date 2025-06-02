import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { useLanguage } from '../../contexts/LanguageContext';
import { ArrowLeft, Save, EyeIcon, Edit2, Plus, Trash, Smile, X, Image as ImageIcon } from 'lucide-react';
import { Draft, createDraft, updateDraft, uploadDraftImage, deleteImage } from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TagInput from '../ui/TagInput';
import TelegramPostPreview from '../ui/TelegramPostPreview';
import { TelegramButton } from '../../types';
import { commonEmojis } from '../../utils/commonEmojis';

interface DraftEditorProps {
  draft: Draft | null;
  onSave: (draft: Draft) => void;
  onCancel: () => void;
}

// Draft-specific single image uploader component
interface DraftImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onError: (error: string) => void;
}

const DraftImageUploader: React.FC<DraftImageUploaderProps> = ({ value, onChange, onError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError(t('publish_panel.invalid_file_type') || 'Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onError(t('publish_panel.file_too_large') || 'Image file is too large. Maximum size is 10MB.');
      return;
    }

    setIsUploading(true);
    onError('');

    try {
      const imageUrl = await uploadDraftImage(file);
      onChange(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      onError(t('publish_panel.upload_error') || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      // Basic URL validation
      try {
        new URL(urlInput.trim());
        onChange(urlInput.trim());
        setUrlInput('');
        setShowUrlInput(false);
        onError('');
      } catch {
        onError(t('publish_panel.invalid_url') || 'Please enter a valid URL');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeImage = async () => {
    if (value) {
      try {
        await deleteImage(value);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative">
          <img src={value} alt="Upload preview" className="max-w-full h-32 object-cover rounded border" />
          <button
            onClick={removeImage}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            type="button"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-2">
              <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>{t('publish_panel.uploading') || 'Uploading...'}</span>
                  </div>
                ) : (
                  <>
                    <p>{t('publish_panel.drag_drop_image') || 'Drag and drop an image or click to select'}</p>
                    <p className="text-xs text-gray-500">{t('publish_panel.max_file_size') || 'Max size: 10MB'}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* URL Input Section */}
          {showUrlInput ? (
            <div className="flex space-x-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={t('publish_panel.enter_image_url') || 'Enter image URL...'}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('common.add') || 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {t('publish_panel.or_enter_url') || 'Or enter image URL'}
              </button>
            </div>
          )}
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

// Draft-specific multiple image uploader component
interface DraftMultipleImageUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
  onError: (error: string) => void;
  maxImages?: number;
}

const DraftMultipleImageUploader: React.FC<DraftMultipleImageUploaderProps> = ({ 
  values, 
  onChange, 
  onError, 
  maxImages = 10 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: File[]) => {
    const remainingSlots = maxImages - values.length;
    
    if (files.length > remainingSlots) {
      onError(`${t('publish_panel.max_images_exceeded') || 'Maximum'} ${maxImages} ${t('publish_panel.images_allowed') || 'images allowed'}`);
      return;
    }

    setIsUploading(true);
    onError('');

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name}: ${t('publish_panel.invalid_file_type') || 'Invalid file type'}`);
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error(`${file.name}: ${t('publish_panel.file_too_large') || 'File too large'}`);
        }

        return await uploadDraftImage(file);
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...values, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      onError(error instanceof Error ? error.message : (t('publish_panel.upload_error') || 'Failed to upload images'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      if (values.length >= maxImages) {
        onError(`${t('publish_panel.max_images_exceeded') || 'Maximum'} ${maxImages} ${t('publish_panel.images_allowed') || 'images allowed'}`);
        return;
      }

      // Basic URL validation
      try {
        new URL(urlInput.trim());
        onChange([...values, urlInput.trim()]);
        setUrlInput('');
        setShowUrlInput(false);
        onError('');
      } catch {
        onError(t('publish_panel.invalid_url') || 'Please enter a valid URL');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(Array.from(files));
    }
  };

  const removeImage = async (index: number) => {
    const urlToRemove = values[index];
    
    // Delete from server only if it's a uploaded file (contains our domain)
    if (urlToRemove && (urlToRemove.includes('/uploads/drafts/') || urlToRemove.includes('localhost') || urlToRemove.includes('.tail10cf98.ts.net'))) {
      try {
        await deleteImage(urlToRemove);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    
    // Remove from local state
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {values.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Upload ${index + 1}`} 
                className="w-full h-24 object-cover rounded border" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded">
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                >
                  <X size={12} />
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {values.length < maxImages && (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-2">
            <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>{t('publish_panel.uploading') || 'Uploading...'}</span>
                </div>
              ) : (
                <>
                  <p>{t('publish_panel.drag_drop_images') || 'Drag and drop images or click to select'}</p>
                  <p className="text-xs text-gray-500">
                    {values.length > 0 
                      ? `${values.length}/${maxImages} ${t('publish_panel.images_uploaded') || 'images uploaded'}`
                      : `${t('publish_panel.max_file_size') || 'Max size: 10MB per image'} • ${t('publish_panel.max_images') || 'Max'} ${maxImages} ${t('publish_panel.images') || 'images'}`
                    }
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* URL Input Section */}
      {showUrlInput ? (
        <div className="flex space-x-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t('publish_panel.enter_image_url') || 'Enter image URL...'}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('common.add') || 'Add'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowUrlInput(false);
              setUrlInput('');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {t('publish_panel.or_enter_url') || 'Or enter image URL'}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

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
                  <DraftImageUploader
                    value={imageUrl}
                    onChange={setImageUrl}
                    onError={setUploadError}
                  />
                ) : (
                  <DraftMultipleImageUploader
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