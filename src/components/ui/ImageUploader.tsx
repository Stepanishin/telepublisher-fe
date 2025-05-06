import React, { useState, useRef, useEffect } from 'react';
import { Upload, ImageIcon, Link, X, Loader, AlertCircle } from 'lucide-react';
import { uploadImage } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  value, 
  onChange,
  onError 
}) => {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<'url' | 'upload'>('url');
  const [error, setError] = useState<string | null>(null);
  
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
      await uploadFile(files[0]);
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
      await uploadFile(files[0]);
    }
  };
  
  const uploadFile = async (file: File) => {
    console.log('uploadFile', file);
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
      onChange(imageUrl);
      
      // Reset state after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
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
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('image_uploader.label')}
      </label>
      
      <div className="flex mb-2">
        <button
          type="button"
          onClick={() => {
            setInputMode('url');
            setError(null);
            onChange('');
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
            onChange('');
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
      {inputMode === 'url' && (
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
            className="hidden"
          />
          
          {isUploading ? (
            <div className="space-y-2">
              <Loader className="animate-spin h-6 w-6 mx-auto text-blue-500" />
              <div className="text-sm text-gray-600">
                {t('image_uploader.uploading')} ({uploadProgress}%)
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : value ? (
            <div className="space-y-2">
              <img 
                src={value} 
                alt="Uploaded preview" 
                className="max-h-32 mx-auto object-contain" 
              />
              <div className="flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  {t('image_uploader.change_image')}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  {t('image_uploader.remove')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
              <div className="flex flex-col items-center text-sm text-gray-600">
                <p>{t('image_uploader.drag_drop')}</p>
                <p>{t('image_uploader.or')}</p>
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="font-medium text-blue-500 hover:text-blue-700"
                >
                  {t('image_uploader.browse_files')}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {t('image_uploader.max_size')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('image_uploader.paste_hint')}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t('image_uploader.hosted_by')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 