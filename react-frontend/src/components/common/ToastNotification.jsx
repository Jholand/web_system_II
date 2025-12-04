import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastNotification = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        zIndex: 99999,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#1e293b',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          fontWeight: '500',
          zIndex: 99999,
          maxWidth: '420px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default ToastNotification;
