import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import StatsCard from '@/components/Dashboard/StatsCard';
import RecentBookings from '@/components/Dashboard/RecentBookings';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboard';
import { Users, MapPin, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const router = useRouter();
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  if (adminLoading || statsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {admin?.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            color="green"
            change={{ value: 12, type: 'increase' }}
          />
          <StatsCard
            title="Total Fields"
            value={stats?.totalFields || 0}
            icon={MapPin}
            color="blue"
            change={{ value: 8, type: 'increase' }}
          />
          <StatsCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            icon={Calendar}
            color="yellow"
            change={{ value: 15, type: 'increase' }}
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={DollarSign}
            color="purple"
            change={{ value: 20, type: 'increase' }}
          />
        </div>

        {/* User Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Dog Owners</span>
                  <span className="text-sm font-semibold text-gray-900">{stats?.dogOwners || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.dogOwners || 0) / (stats?.totalUsers || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Field Owners</span>
                  <span className="text-sm font-semibold text-gray-900">{stats?.fieldOwners || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.fieldOwners || 0) / (stats?.totalUsers || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/bookings')}
                className="p-3 text-sm font-medium text-green bg-green-lighter rounded-lg hover:bg-light-green hover:text-white transition-colors"
              >
                View All Bookings
              </button>
              <button
                onClick={() => router.push('/fields')}
                className="p-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Manage Fields
              </button>
              <button
                onClick={() => router.push('/dog-owners')}
                className="p-3 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                View Users
              </button>
              <button
                onClick={() => router.push('/payments')}
                className="p-3 text-sm font-medium text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                Payment History
              </button>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <RecentBookings bookings={stats?.recentBookings || []} />
      </div>
    </AdminLayout>
  );
}