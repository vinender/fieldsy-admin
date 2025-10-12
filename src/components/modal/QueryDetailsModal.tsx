import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ContactQuery } from '@/hooks/useContactQueries';
import { formatDate, formatTime } from '@/lib/utils';

interface QueryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: ContactQuery;
  onUpdateStatus: (status: string, notes?: string) => void;
  isUpdating?: boolean;
}

export default function QueryDetailsModal({
  isOpen,
  onClose,
  query,
  onUpdateStatus,
  isUpdating = false
}: QueryDetailsModalProps) {
  const [status, setStatus] = useState(query.status);
  const [notes, setNotes] = useState(query.adminNotes || '');

  useEffect(() => {
    setStatus(query.status);
    setNotes(query.adminNotes || '');
  }, [query]);

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

  const handleSubmit = () => {
    onUpdateStatus(status, notes);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green-700 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Query Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Submitted on {formatDate(query.createdAt)} at {formatTime(query.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact Information */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-base text-gray-900 mt-1">{query.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-base text-gray-900 mt-1">{query.email}</p>
                </div>
                {query.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-base text-gray-900 mt-1">{query.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <p className="text-base text-gray-900 mt-1">{query.subject}</p>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-gray-500">Message</label>
              <div className="mt-2 bg-gray-50 rounded-xl p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{query.message}</p>
              </div>
            </div>

            {/* Status Update */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Update Status
              </label>
              <div className="flex space-x-3">
                {['new', 'in-progress', 'resolved'].map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => setStatus(statusOption as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      status === statusOption
                        ? getStatusBadgeColor(statusOption)
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {statusOption === 'in-progress' ? 'In Progress' : statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Admin Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this query..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Timestamps */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">{formatDate(query.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 text-gray-900">{formatDate(query.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
