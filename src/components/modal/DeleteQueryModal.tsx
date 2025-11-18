import React, { useEffect } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  queryName: string;
  isDeleting?: boolean;
}

export default function DeleteQueryModal({
  isOpen,
  onClose,
  onConfirm,
  queryName,
  isDeleting = false
}: DeleteQueryModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Query</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <p className="text-gray-600">
              Are you sure you want to delete the query from <span className="font-semibold">{queryName}</span>?
              This action cannot be undone.
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center border border-red gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 text-red" />
              <span className='text-red  border-red'>{isDeleting ? 'Deleting...' : 'Delete Query'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
