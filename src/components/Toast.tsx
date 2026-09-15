import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast) {
    return <div id="toast" className="toast" />;
  }

  return (
    <div id="toast" className={`toast show ${toast.type}`}>
      {toast.text}
    </div>
  );
};
