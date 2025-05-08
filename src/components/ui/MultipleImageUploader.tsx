import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, Loader, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { uploadImage } from '../../services/api';
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle clipboard paste event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
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
  }, []);
  
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
    onChange([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    if (values.length > 0) {
      const newValues = [...values];
      newValues.splice(index, 1);
      onChange(newValues);
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
        {t('image_uploader.label_multiple') || 'Upload Images (max 10)'}
      </label>
      
      {/* Display error message if present */}
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-700 rounded border border-red-200 text-sm flex items-start">
          <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Upload area */}
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
              onClick={triggerFileInput}
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