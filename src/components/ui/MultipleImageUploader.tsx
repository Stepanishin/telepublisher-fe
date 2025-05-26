import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, Loader, AlertCircle, Plus, Trash2, Upload, Link as LinkIcon } from 'lucide-react';
import { uploadImage, deleteImage } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

interface MultipleImageUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
  onError?: (error: string) => void;
  maxImages?: number;
}

const MultipleImageUploader: React.FC<MultipleImageUploaderProps> = ({ 
  values = [],
  onChange,
  onError,
  maxImages = 10
}) => {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('upload');
  const [imageUrl, setImageUrl] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle clipboard paste event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Только обрабатываем вставку для режима загрузки
      if (inputMode !== 'upload') return;
      
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            uploadFile(file);
            break;
          }
        }
      }
    };
    
    // Add event listener for paste
    window.addEventListener('paste', handlePaste);
    
    // Cleanup
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [inputMode]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // For multiple mode, upload each file
      for (let i = 0; i < files.length; i++) {
        if (values.length >= maxImages) {
          const message = t('image_uploader.max_images_reached') || `Maximum of ${maxImages} images allowed`;
          setError(message);
          onError?.(message);
          break;
        }
        await uploadFile(files[i]);
      }
    }
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        if (values.length >= maxImages) {
          const message = t('image_uploader.max_images_reached') || `Maximum of ${maxImages} images allowed`;
          setError(message);
          onError?.(message);
          break;
        }
        await uploadFile(files[i]);
      }
    }
  };
  
  const uploadFile = async (file: File) => {
    console.log('uploadFile', file);
    setCurrentFile(file.name);
    // Clear any previous errors
    setError(null);
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      const message = t('image_uploader.error_not_image') || 'Selected file is not an image';
      setError(message);
      onError?.(message);
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const message = t('image_uploader.error_too_large') || 'Image is too large (max 10MB)';
      setError(message);
      onError?.(message);
      return;
    }
    
    try {
      setIsUploading(true);
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Upload the file
      const imageUrl = await uploadImage(file);
      
      // Clear the interval and set progress to 100%
      clearInterval(interval);
      setUploadProgress(100);
      
      // Update the parent component with the new image URL
      const newValues = [...values, imageUrl];
      onChange(newValues);
      
      // Reset state after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setCurrentFile(null);
      }, 500);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentFile(null);
      const message = t('image_uploader.error_upload_failed') || 'Failed to upload image';
      setError(message);
      onError?.(message);
      console.error('Error uploading image:', error);
    }
  };
  
  const handleClear = () => {
    // Delete all images from server before clearing
    if (values.length > 0) {
      values.forEach(imageUrl => {
        if (imageUrl.includes('/uploads/')) {
          deleteImage(imageUrl).then(success => {
            if (success) {
              console.log('Successfully deleted image from server:', imageUrl);
            }
          });
        }
      });
    }
    onChange([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    if (values.length > 0) {
      const newValues = [...values];
      const imageToRemove = newValues[index];
      
      // Delete the image from server
      if (imageToRemove && imageToRemove.includes('/uploads/')) {
        deleteImage(imageToRemove).then(success => {
          if (success) {
            console.log('Successfully deleted image from server:', imageToRemove);
          }
        });
      }
      
      newValues.splice(index, 1);
      onChange(newValues);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Функция для проверки URL изображения
  const validateImageUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };
  
  // Обработчик добавления изображения по URL
  const handleAddImageByUrl = () => {
    // Сбросить ошибку
    setError(null);
    
    // Проверить, что URL не пустой
    if (!imageUrl.trim()) {
      const message = t('image_uploader.error_empty_url') || 'Please enter an image URL';
      setError(message);
      onError?.(message);
      return;
    }
    
    // Проверить, что URL валидный
    if (!validateImageUrl(imageUrl)) {
      const message = t('image_uploader.error_invalid_url') || 'Please enter a valid URL (e.g., https://example.com/image.jpg)';
      setError(message);
      onError?.(message);
      return;
    }
    
    // Проверить количество изображений
    if (values.length >= maxImages) {
      const message = t('image_uploader.max_images_reached') || `Maximum of ${maxImages} images allowed`;
      setError(message);
      onError?.(message);
      return;
    }
    
    // Добавить URL в список изображений
    const newValues = [...values, imageUrl];
    onChange(newValues);
    
    // Очистить поле ввода
    setImageUrl('');
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('image_uploader.label_multiple') || 'Upload Images (max 10)'}
      </label>
      
      {/* Переключатель режимов ввода */}
      <div className="flex mb-2">
        <button
          type="button"
          onClick={() => {
            setInputMode('url');
            setError(null);
          }}
          className={`px-3 py-1 text-xs rounded-l-md ${
            inputMode === 'url' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <LinkIcon size={14} className="inline mr-1" />
          {t('image_uploader.url_mode') || 'URL'}
        </button>
        <button
          type="button"
          onClick={() => {
            setInputMode('upload');
            setError(null);
          }}
          className={`px-3 py-1 text-xs rounded-r-md ${
            inputMode === 'upload' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Upload size={14} className="inline mr-1" />
          {t('image_uploader.upload_mode') || 'Upload'}
        </button>
      </div>
      
      {/* Display error message if present */}
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-700 rounded border border-red-200 text-sm flex items-start">
          <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* URL input mode */}
      {inputMode === 'url' && (
        <div className="mb-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder={t('image_uploader.url_placeholder') || "Enter image URL (https://...)"}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm flex-grow
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImageByUrl();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddImageByUrl}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
            >
              {t('image_uploader.add_url') || 'Add'}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {t('image_uploader.url_hint') || "Enter the URL of an image and click 'Add' or press Enter"}
          </p>
        </div>
      )}
      
      {/* Upload mode */}
      {inputMode === 'upload' && (
        <div
          className={`border-2 border-dashed rounded-md p-4 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple={true}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Loader className="animate-spin h-6 w-6 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {t('image_uploader.uploading') || 'Uploading'} {currentFile && `${currentFile}...`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div
              onClick={triggerFileInput}
              className="cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <ImageIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-sm text-gray-600">
                  {t('image_uploader.drag_multiple') || 'Drag & drop images here or click to select'}
                </div>
                <div className="text-xs text-gray-500">
                  {t('image_uploader.supported_formats') || 'JPEG, PNG, GIF, WebP'}
                </div>
                <div className="text-xs text-gray-500">
                  {t('image_uploader.max_count_message') || `You can upload up to ${maxImages} images`}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image thumbnails grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
          {values.map((imageUrl, index) => (
            <div key={index} className="relative rounded-md overflow-hidden border border-gray-300">
              <div className="aspect-square bg-gray-100 relative">
                <img 
                  src={imageUrl} 
                  alt={`Uploaded ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  className="absolute top-1 right-1 p-1 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80"
                  onClick={() => handleRemoveImage(index)}
                  title={t('image_uploader.remove_image') || 'Remove image'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {values.length < maxImages && (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center p-4 aspect-square cursor-pointer hover:border-blue-500 hover:bg-blue-50"
              onClick={inputMode === 'upload' ? triggerFileInput : () => setInputMode('url')}
            >
              <Plus size={24} className="text-gray-400" />
            </div>
          )}
        </div>
      )}
      
      {/* Clear all button */}
      {values.length > 0 && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700 flex items-center"
          >
            <Trash2 size={12} className="mr-1" />
            {t('image_uploader.clear_all') || 'Clear all images'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUploader; 