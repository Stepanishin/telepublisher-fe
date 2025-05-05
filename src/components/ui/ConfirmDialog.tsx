import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmType?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmType = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const overlayClasses = `fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4`;
  const modalClasses = `bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden`;
  const headerClasses = `px-6 py-4 border-b flex justify-between items-center`;
  const bodyClasses = `px-6 py-4`;
  const footerClasses = `px-6 py-4 bg-gray-50 flex justify-end space-x-3`;

  const confirmBtnClasses = 
    confirmType === 'danger' 
      ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white' 
      : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500 text-white';

  return (
    <div className={overlayClasses} onClick={onCancel}>
      <div className={modalClasses} onClick={(e) => e.stopPropagation()}>
        <div className={headerClasses}>
          <div className="flex items-center">
            {confirmType === 'danger' && (
              <AlertCircle size={20} className="text-red-500 mr-2" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-500 focus:outline-none" 
            onClick={onCancel}
          >
            <X size={20} />
          </button>
        </div>
        <div className={bodyClasses}>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className={footerClasses}>
          <Button 
            variant="ghost" 
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button 
            className={confirmBtnClasses}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 