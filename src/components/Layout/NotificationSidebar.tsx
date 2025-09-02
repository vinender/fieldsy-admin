import React from 'react';
import { X, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({ isOpen, onClose }) => {
  // Mock notifications - in real app, fetch from API
  const notifications = [
    {
      id: '1',
      type: 'booking',
      icon: CheckCircle,
      color: 'text-green-500',
      title: 'New Booking',
      message: 'John Doe booked Central Park Field',
      time: new Date().toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'payment',
      icon: AlertCircle,
      color: 'text-yellow-500',
      title: 'Payment Pending',
      message: 'Payment verification needed for booking #1234',
      time: new Date().toISOString(),
      read: false,
    },
    {
      id: '3',
      type: 'user',
      icon: Info,
      color: 'text-blue-500',
      title: 'New User Registration',
      message: 'Sarah Wilson registered as a field owner',
      time: new Date().toISOString(),
      read: true,
    },
    {
      id: '4',
      type: 'cancellation',
      icon: XCircle,
      color: 'text-red-500',
      title: 'Booking Cancelled',
      message: 'Booking #5678 has been cancelled',
      time: new Date().toISOString(),
      read: true,
    },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100vh-88px)]">
          <div className="p-4 space-y-4">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    notification.read
                      ? 'bg-white border-gray-200 hover:bg-gray-50'
                      : 'bg-green-lighter border-green hover:bg-light-green hover:text-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${notification.color}`} />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.time)} at {formatTime(notification.time)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-green rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;