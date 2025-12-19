import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Package,
  ChevronRight,
  FileText,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { useLogout, useVerifyAdmin } from '@/hooks/useAuth';
import { useAdminNotifications } from '@/hooks/useNotifications';
import { useSocket } from '@/hooks/useSocket';
import NotificationSidebar from './NotificationSidebar';
import ProfileSidebar from './ProfileSidebar';
import BackButton from '@/components/common/BackButton';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const logout = useLogout();
  const { data: admin } = useVerifyAdmin();
  const { data: notificationsData } = useAdminNotifications(1, 50);

  // Handle real-time notification updates
  const handleNotification = useCallback((notification: any) => {
    console.log('Real-time notification received in AdminLayout:', notification);
    // The socket hook already invalidates queries, so no need to do anything here
  }, []);

  // Initialize socket connection for real-time notifications
  const { isConnected } = useSocket({
    autoConnect: true,
    onNotification: handleNotification,
    onConnect: () => console.log('Admin socket connected'),
    onDisconnect: () => console.log('Admin socket disconnected')
  });

  const unreadCount = notificationsData?.unreadCount || 0;
  const isDashboard = router.pathname === '/dashboard';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Calendar, label: 'Bookings', href: '/bookings' },
    { icon: CreditCard, label: 'Transactions', href: '/transactions' },
    { icon: MapPin, label: 'Fields', href: '/fields' },
    { icon: Users, label: 'Dog Owners', href: '/dog-owners' },
    { icon: Users, label: 'Field Owners', href: '/field-owners' },
    { icon: FileText, label: 'Claims', href: '/claims' },
    { icon: MessageSquare, label: 'Queries', href: '/queries' },
    { icon: Package, label: 'Amenities', href: '/amenities' },
    { icon: Package, label: 'Field Options', href: '/field-options' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const isActive = (href: string) => {
    return router.pathname === href;
  };

  return (
    <div className="flex h-screen bg-light">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark-green text-white transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-green-darker">
            <Image
              src="/logo/logo-cream.png"
              alt="Fieldsy Admin"
              width={120}
              height={40}
              priority
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6  space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active
                      ? 'bg-light-green text-white rounded-[16px]'
                      : 'text-cream hover:bg-green-hover hover:text-white'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-white text-sm">{item.label}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-green-darker">
            <button
              onClick={logout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-cream hover:bg-green-hover hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              {!isDashboard && <BackButton size="sm" />}
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                onClick={() => setNotificationOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </>
                )}
              </button>

              {/* Profile */}
              <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
                  <p className="text-xs text-gray-500">{admin?.email}</p>
                </div>
                {admin?.image ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={admin.image}
                      alt={admin.name || 'Admin'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full bg-green-lighter rounded-full flex items-center justify-center"><span class="text-green text-sm font-semibold">${(admin.name || admin.email)?.charAt(0).toUpperCase()}</span></div>`;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-green-lighter rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green text-sm font-semibold">
                      {(admin?.name || admin?.email)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-light">
          <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Notification Sidebar */}
      <NotificationSidebar
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Profile Sidebar */}
      <ProfileSidebar
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;