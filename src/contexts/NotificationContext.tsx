import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  type: NotificationType;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notification: Notification | null;
  setNotification: (notification: Notification | null) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notification: null,
  setNotification: () => {},
  clearNotification: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotificationState] = useState<Notification | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const setNotification = (notification: Notification | null) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    setNotificationState(notification);

    // Set a timeout to clear the notification
    if (notification) {
      const duration = notification.duration || 5000; // Default to 5 seconds
      const id = setTimeout(() => {
        setNotificationState(null);
      }, duration);
      setTimeoutId(id);
    }
  };

  const clearNotification = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setNotificationState(null);
  };

  return (
    <NotificationContext.Provider value={{ notification, setNotification, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext); 