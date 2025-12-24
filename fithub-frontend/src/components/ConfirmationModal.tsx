import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode; // Change type to ReactNode
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean; // To show loading state on confirm button
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center p-4 z-50">
      <div className="bg-sky-100 p-6 rounded-xl shadow-2xl w-full max-w-sm relative border border-sky-200">
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-full p-2 shadow transition-colors duration-150 z-10" aria-label="Close">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isConfirming}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Deleting...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
