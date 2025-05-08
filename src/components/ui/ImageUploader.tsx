import React, { useState, useRef, useEffect } from 'react';
import { Upload, ImageIcon, Link, X, Loader, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { uploadImage } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

interface ImageUploaderProps {
  value: string;
  values?: string[];
  onChange: (url: string) => void;
  onMultipleChange?: (urls: string[]) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  value, 
  values = [],
  onChange,
  onMultipleChange,
  onError,
  multiple = false,
  maxImages = 10
}) => {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');
  const [error, setError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle clipboard paste event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
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
      if (multiple) {
        // For multiple mode, we upload each file
        for (let i = 0; i < files.length; i++) {
          if (multiple && values.length >= maxImages) {
            const message = t('image_uploader.max_images_reached');
            setError(message);
            onError?.(message);
            break;
          }
          await uploadFile(files[i]);
        }
      } else {
        await uploadFile(files[0]);
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
      if (multiple) {
        // For multiple mode, we upload each file
        for (let i = 0; i < files.length; i++) {
          if (multiple && values.length >= maxImages) {
            const message = t('image_uploader.max_images_reached');
            setError(message);
            onError?.(message);
            break;
          }
          await uploadFile(files[i]);
        }
      } else {
        await uploadFile(files[0]);
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
      const message = t('image_uploader.error_not_image');
      setError(message);
      onError?.(message);
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const message = t('image_uploader.error_too_large');
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
      if (multiple) {
        const newValues = [...values, imageUrl];
        onMultipleChange?.(newValues);
      } else {
        onChange(imageUrl);
      }
      
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
      const message = t('image_uploader.error_upload_failed');
      setError(message);
      onError?.(message);
      console.error('Error uploading image:', error);
    }
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  const handleClear = () => {
    if (multiple) {
      onMultipleChange?.([]);
    } else {
      onChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    if (multiple && values.length > 0) {
      const newValues = [...values];
      newValues.splice(index, 1);
      onMultipleChange?.(newValues);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Render image thumbnails for multiple mode
  const renderImageThumbnails = () => {
    if (!multiple || values.length === 0) return null;

    return (
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
            onClick={triggerFileInput}
          >
            <Plus size={24} className="text-gray-400" />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {multiple ? t('image_uploader.label_multiple') || 'Upload Images (max 10)' : t('image_uploader.label')}
      </label>
      
      <div className="flex mb-2">
        <button
          type="button"
          onClick={() => {
            setInputMode('url');
            setError(null);
            if (multiple) {
              onMultipleChange?.([]);
            } else {
              onChange('');
            }
          }}
          className={`px-3 py-1 text-xs rounded-l-md ${
            inputMode === 'url' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Link size={14} className="inline mr-1" />
          {t('image_uploader.url_mode')}
        </button>
        <button
          type="button"
          onClick={() => {
            setInputMode('upload');
            setError(null);
            if (multiple) {
              onMultipleChange?.([]);
            } else {
              onChange('');
            }
          }}
          className={`px-3 py-1 text-xs rounded-r-md ${
            inputMode === 'upload' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Upload size={14} className="inline mr-1" />
          {t('image_uploader.upload_mode')}
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
      {inputMode === 'url' && !multiple && (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleUrlChange}
            placeholder={t('image_uploader.url_placeholder')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm w-full
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {value && (
            <button 
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
      
      {/* Multiple URL input mode - Not implemented for simplicity */}
      {inputMode === 'url' && multiple && (
        <div className="p-3 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 text-sm">
          {t('image_uploader.multiple_url_not_supported') || 'URL mode with multiple images is not supported. Please use upload mode for multiple images.'}
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
            multiple={multiple}
            className="hidden"
          />
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Loader className="animate-spin h-6 w-6 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {t('image_uploader.uploading')} {currentFile && `${currentFile}...`}
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
                  {multiple 
                    ? t('image_uploader.drag_multiple') || 'Drag & drop images here or click to select'
                    : t('image_uploader.drag_single') || 'Drag & drop image here or click to select'}
                </div>
                <div className="text-xs text-gray-500">
                  {t('image_uploader.supported_formats')}
                </div>
                {multiple && (
                  <div className="text-xs text-gray-500">
                    {t('image_uploader.max_count_message') || `You can upload up to ${maxImages} images`}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Show image preview if not in multiple mode */}
          {!multiple && !isUploading && value && (
            <div className="mt-4">
              <div className="relative rounded-md overflow-hidden border border-gray-300 max-w-md mx-auto">
                <img 
                  src={value} 
                  alt="Uploaded" 
                  className="max-w-full" 
                />
                <button
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80"
                  onClick={handleClear}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multiple images thumbnails */}
      {renderImageThumbnails()}
    </div>
  );
};

export default ImageUploader; 
