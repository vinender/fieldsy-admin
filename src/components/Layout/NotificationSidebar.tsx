import React, { useEffect } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Star,
  Bell,
  Check,
  CheckCheck
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAdminNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({ isOpen, onClose }) => {
  const { data: notificationsData, isLoading } = useAdminNotifications(1, 50);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  // Get background color for unread notifications based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_received':
      case 'booking_confirmed':
        return 'border-blue-300 bg-blue-50';
      case 'field_approved':
        return 'border-green-300 bg-green-50';
      case 'payment_received':
        return 'border-yellow-300 bg-yellow-50';
      case 'review_posted':
        return 'border-purple-300 bg-purple-50';
      default:
        return 'border-gray-300 bg-gray-50';
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

  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutate(id);
  };

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:max-w-[540px] bg-light z-50 transform transition-transform duration-300 ease-out overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <button
                onClick={onClose}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-cream rounded-full flex items-center justify-center hover:bg-[#efe5bf] transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-dark-green" />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-[22px] sm:text-[29px] font-semibold text-dark-green truncate">Notifications</h2>
                {unreadCount > 0 && (
                  <p className="text-xs sm:text-sm text-gray-600">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1.5 sm:p-2 text-green hover:bg-green/10 rounded-lg transition-colors sm:hidden"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                <button
                  onClick={handleMarkAllAsRead}
                  className="hidden sm:block p-2 text-green text-[14px] sm:text-[16px] font-[600] underline hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                  title="Mark all as read"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200" />

        {/* Content */}
        <div
          className="h-[calc(100%-140px)] overflow-y-auto overflow-x-hidden notification-scrollbar"
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          {isLoading ? (
            <div className="text-center text-gray-600 mt-10">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center mt-10">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No notifications yet</p>
              <p className="text-sm text-gray-500 mt-2">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b py-2 transition-all cursor-pointer ${
                    !notification.read
                      ? `${getNotificationColor(notification.type)} border-opacity-50`
                      : 'border-gray-200 bg-light-cream hover:bg-cream'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-2 p-3 sm:p-4">
                    <div className="flex gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <div className="text-dark-green font-[600] sm:font-[700] text-[16px] sm:text-[18px] flex-1 break-words">
                            {notification.title}
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-green rounded-full flex-shrink-0 mt-2"></span>
                          )}
                        </div>
                        <div className="text-[13px] sm:text-[14px] text-gray-700 font-[400] mt-1 break-words">
                          {notification.message}
                        </div>
                        {notification.user && (
                          <p className="text-[11px] sm:text-xs text-gray-500 mt-2">
                            From: {notification.user.name || notification.user.email}
                            ({notification.user.role === 'DOG_OWNER' ? 'Dog Owner' : 'Field Owner'})
                          </p>
                        )}
                        <div className="text-[11px] sm:text-xs text-gray-500 mt-2">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-1 text-green hover:bg-green/10 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;