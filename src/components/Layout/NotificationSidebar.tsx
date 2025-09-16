import React, { useEffect } from 'react';
import { 
  X, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Calendar,
  DollarSign,
  MapPin,
  User,
  Star,
  Bell
} from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import { useAdminNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({ isOpen, onClose }) => {
  const { data: notificationsData, isLoading } = useAdminNotifications(1, 50);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Get icon and color based on notification type
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'booking_received':
      case 'booking_confirmed':
        return { icon: Calendar, color: 'text-green-500' };
      case 'booking_cancelled':
        return { icon: XCircle, color: 'text-red-500' };
      case 'payment_received':
      case 'payment_success':
        return { icon: DollarSign, color: 'text-green-500' };
      case 'payment_failed':
        return { icon: AlertCircle, color: 'text-red-500' };
      case 'field_approved':
      case 'field_added':
        return { icon: MapPin, color: 'text-blue-500' };
      case 'review_posted':
        return { icon: Star, color: 'text-yellow-500' };
      case 'user_registered':
        return { icon: User, color: 'text-blue-500' };
      case 'refund_processed':
        return { icon: DollarSign, color: 'text-yellow-500' };
      default:
        return { icon: Info, color: 'text-gray-500' };
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead.mutate(notification.id);
    }
    
    // Navigate based on notification type and data
    if (notification.data) {
      if (notification.data.bookingId) {
        window.location.href = `/bookings/${notification.data.bookingId}`;
      } else if (notification.data.fieldId) {
        window.location.href = `/fields/${notification.data.fieldId}`;
      } else if (notification.data.userId) {
        const userRole = notification.data.userRole;
        if (userRole === 'DOG_OWNER') {
          window.location.href = `/dog-owners/${notification.data.userId}`;
        } else if (userRole === 'FIELD_OWNER') {
          window.location.href = `/field-owners/${notification.data.userId}`;
        }
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutate();
  };

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

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
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100vh-88px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Bell className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">No notifications yet</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {notifications.map((notification) => {
                const { icon: Icon, color } = getNotificationStyle(notification.type);
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 sm:p-4 rounded-lg border transition-colors cursor-pointer ${
                      notification.read
                        ? 'bg-white border-gray-200 hover:bg-gray-50'
                        : 'bg-green-50 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                          {notification.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                          {notification.message}
                        </p>
                        {notification.user && (
                          <p className="text-xs text-gray-500 mt-2">
                            From: {notification.user.name || notification.user.email} 
                            ({notification.user.role === 'DOG_OWNER' ? 'Dog Owner' : 'Field Owner'})
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.createdAt)} at {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;