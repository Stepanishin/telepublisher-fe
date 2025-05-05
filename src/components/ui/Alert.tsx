import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

interface AlertProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  onClose
}) => {
  const variants = {
    success: {
      containerClass: 'bg-green-50 border-green-500 text-green-700',
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      defaultTitle: 'Успешно!'
    },
    error: {
      containerClass: 'bg-red-50 border-red-500 text-red-700',
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      defaultTitle: 'Ошибка!'
    },
    warning: {
      containerClass: 'bg-yellow-50 border-yellow-500 text-yellow-700',
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      defaultTitle: 'Внимание!'
    },
    info: {
      containerClass: 'bg-blue-50 border-blue-500 text-blue-700',
      icon: <Info className="h-5 w-5 text-blue-500" />,
      defaultTitle: 'Информация'
    }
  };

  const { containerClass, icon, defaultTitle } = variants[variant];
  const alertTitle = title || defaultTitle;

  return (
    <div className={`border-l-4 p-4 mb-4 rounded-r-md ${containerClass}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{alertTitle}</h3>
          <div className="mt-1 text-sm">
            {message}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto pl-3 -my-1.5 -mr-1.5 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="sr-only">Закрыть</span>
            <svg
              className="h-4 w-4 text-gray-500 hover:text-gray-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;