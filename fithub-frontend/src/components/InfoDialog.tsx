import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface InfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  buttonText?: string;
}

const InfoDialog: React.FC<InfoDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm relative border border-gray-200">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-full p-2 shadow transition-colors duration-150 z-10" aria-label="Close">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
        <div className="text-gray-700 mb-6">{message}</div>
        <div className="flex justify-end">
          <Button type="button" onClick={onClose}>{buttonText}</Button>
        </div>
      </div>
    </div>
  );
};

export default InfoDialog;
