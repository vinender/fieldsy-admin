import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import StatsCardNew from '@/components/Dashboard/StatsCardNew';
import TimePeriodToggle from '@/components/Dashboard/TimePeriodToggle';
import DonutChart from '@/components/Dashboard/DonutChart';
import LineChart from '@/components/Dashboard/LineChart';
import BookingRow, { BookingData } from '@/components/Dashboard/BookingRow';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboard';
import { Users, MapPin, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const router = useRouter();
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const [activePeriod, setActivePeriod] = useState('Weekly');
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats(activePeriod);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingStats, setBookingStats] = useState<any[]>([]);
  const [fieldUtilizationStats, setFieldUtilizationStats] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [chartsLoading, setChartsLoading] = useState(false);

  useEffect(() => {
    if (!adminLoading) {
      if (adminError || !admin) {
        console.log('Admin verification failed, redirecting to login', { adminError, admin });
        router.push('/login');
      } else {
        console.log('Admin verified:', admin);
      }
    }
  }, [admin, adminLoading, adminError, router]);

  useEffect(() => {
    if (admin) {
      setChartsLoading(true);
      fetchRecentBookings();
      fetchBookingStats();
      fetchFieldUtilization();
      calculateTotalRevenue();
      refetchStats();
      // Set loading to false after a delay to show skeleton
      setTimeout(() => setChartsLoading(false), 500);
    }
  }, [admin, activePeriod]);

  const calculateTotalRevenue = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/revenue/total`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTotalRevenue(data.totalRevenue || 0);
      } else {
        // Fallback: calculate from bookings
        const bookingsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/bookings/all`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          const total = bookingsData.bookings?.reduce((sum: number, booking: any) => {
            if (booking.paymentStatus === 'PAID') {
              return sum + (booking.totalPrice || 0);
            }
            return sum;
          }, 0) || 0;
          setTotalRevenue(total);
        }
      }
    } catch (error) {
      console.error('Error calculating revenue:', error);
    }
  };

  const fetchBookingStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/booking-stats?period=${activePeriod}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setBookingStats(data.chartData || []);
      } else {
        // Use empty data on error
        setBookingStats([]);
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      setBookingStats([]);
    }
  };

  const fetchFieldUtilization = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/field-utilization?period=${activePeriod}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setFieldUtilizationStats(data.chartData || []);
      } else {
        setFieldUtilizationStats([]);
      }
    } catch (error) {
      console.error('Error fetching field utilization:', error);
      setFieldUtilizationStats([]);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      setLoadingBookings(true);
      const token = localStorage.getItem('adminToken');
      
      // Fetch all bookings from admin endpoint (already sorted by most recent)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const bookingsArray = data.bookings || [];
        
        // The API already returns bookings sorted by createdAt desc, so just take first 5
        const recentBookings = bookingsArray.slice(0, 5);
        
        const transformedBookings: BookingData[] = recentBookings.map((booking: any) => ({
          id: booking.id || booking._id,
          fieldName: booking.field?.name || 'Unknown Field',
          ownerName: booking.field?.owner?.name || 'Unknown Owner',
          image: booking.field?.images?.[0] || '/api/placeholder/40/40',
          timeSlot: `${booking.startTime || '00:00'}-${booking.endTime || '00:00'}`,
          status: booking.status || 'PENDING',
          duration: calculateDuration(booking.startTime, booking.endTime),
          date: new Date(booking.date || booking.createdAt).toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }),
          dogs: booking.numberOfDogs || 1,
          price: booking.totalPrice || 0,
          recurring: booking.isRecurring ? 'Yes' : 'No',
          customerName: booking.user?.name || 'Unknown'
        }));
        
        setBookings(transformedBookings);
      } else {
        console.error('Failed to fetch bookings:', response.status);
        // Try the stats endpoint as fallback
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          const recentBookings = statsData.stats?.recentBookings || [];
          
          const transformedBookings: BookingData[] = recentBookings.slice(0, 5).map((booking: any) => ({
            id: booking.id || booking._id,
            fieldName: booking.field?.name || 'Unknown Field',
            ownerName: booking.field?.owner?.name || 'Unknown Owner',
            image: booking.field?.images?.[0] || '/api/placeholder/40/40',
            timeSlot: `${booking.startTime || '00:00'}-${booking.endTime || '00:00'}`,
            status: booking.status || 'PENDING',
            duration: calculateDuration(booking.startTime, booking.endTime),
            date: new Date(booking.date || booking.createdAt).toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            }),
            dogs: booking.numberOfDogs || 1,
            price: booking.totalPrice || 0,
            recurring: booking.isRecurring ? 'Yes' : 'No',
            customerName: booking.user?.name || 'Unknown'
          }));
          
          setBookings(transformedBookings);
        } else {
          setBookings([]);
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '1 hr';
    
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (diff < 1) {
      return `${Math.round(diff * 60)}min`;
    } else {
      return `${Math.round(diff)} hr`;
    }
  };

  if (adminLoading || statsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const statsData = [
    { 
      title: 'Active Fields', 
      value: stats?.totalFields || 0, 
      change: stats?.growth?.fields || 0,
      icon: '/dashboard/active-fields.svg',
      useImage: true
    },
    { 
      title: 'Registered Users', 
      value: stats?.totalUsers || 0, 
      change: stats?.growth?.users || 0,
      icon: '/dashboard/users.svg',
      useImage: true
    },
    { 
      title: 'Upcoming Bookings', 
      value: stats?.upcomingBookings || 0, 
      change: stats?.growth?.upcomingBookings || 0,
      icon: '/dashboard/bookings.svg',
      useImage: true
    },
    { 
      title: 'Total Revenue', 
      value: formatCurrency(totalRevenue || stats?.totalRevenue || 0), 
      change: stats?.growth?.revenue || 0,
      icon: '/dashboard/revenue.svg',
      useImage: true
    }
  ];

  const userSegments = [
    { 
      label: 'Field Owners', 
      value: stats?.fieldOwners || 0, 
      color: 'bg-[#3a6b22]' 
    },
    { 
      label: 'Dog Owners', 
      value: stats?.dogOwners || 0, 
      color: 'bg-[#8fb366]' 
    }
  ];

  return (
    <AdminLayout>
      <div className="bg-light min-h-screen p-3 sm:p-4 md:p-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-[#192215] text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <div className="overflow-x-auto">
              <TimePeriodToggle
                periods={['Today', 'Weekly', 'Monthly', 'Yearly']}
                activePeriod={activePeriod}
                onPeriodChange={setActivePeriod}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsData.map((stat, idx) => (
              <StatsCardNew 
                key={idx} 
                {...stat} 
                loading={statsLoading}
              />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            <LineChart
              title="Field Utilization"
              data={fieldUtilizationStats}
              colors={[
                { label: 'Active Fields', bg: 'bg-[#3a6b22]' },
                { label: 'Total Bookings', bg: 'bg-[#8fb366]' },
                { label: 'Utilization %', bg: 'bg-[#192215]' }
              ]}
              loading={chartsLoading || statsLoading}
              showLines={false}
            />
            
            <LineChart
              title="Booking Status"
              data={bookingStats}
              colors={[
                { label: 'Completed', bg: 'bg-[#8fb366]' },
                { label: 'Cancelled', bg: 'bg-[#ff0000]' },
                { label: 'Refunded', bg: 'bg-[#ffbd00]' }
              ]}
              loading={chartsLoading || statsLoading}
              showLines={true}
            />
            
            <DonutChart
              total={(stats?.fieldOwners || 0) + (stats?.dogOwners || 0)}
              segments={userSegments}
              loading={chartsLoading || statsLoading}
            />
          </div>

          {/* Bookings Table */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
              <h2 className="text-[#192215] text-xl sm:text-2xl font-bold">Bookings Overview</h2>
              <button
                onClick={() => router.push('/bookings')}
                className="text-[#3a6b22] hover:text-[#2d5419] text-sm font-medium whitespace-nowrap"
              >
                View All →
              </button>
            </div>
            
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl overflow-hidden border border-black/10 shadow-md">
              {/* Table Header */}
              <div className="bg-[#ebebeb] px-6 py-3">
                <div className="flex items-center justify-between text-[#575757] text-xs">
                  <div className="w-6" />
                  <span className="w-[59px]">Booking ID</span>
                  <span className="w-[175px]">Field & owner name</span>
                  <span className="w-[92px]">Time Slot</span>
                  <span className="w-[88px]">Status</span>
                  <span className="w-[50px]">Duration</span>
                  <span className="w-[85px]">Date</span>
                  <span className="w-8">Dogs</span>
                  <span className="w-[33px]">Price</span>
                  <span className="w-14">Recurring</span>
                  <span className="w-[88px]">Action</span>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="px-6 max-h-[400px] overflow-y-auto">
                {loadingBookings ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No bookings found
                  </div>
                ) : (
                  bookings.slice(0, 5).map((booking) => (
                    <BookingRow key={booking.id} booking={booking} />
                  ))
                )}
              </div>
            </div>
            
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {loadingBookings ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-8 text-center text-gray-500 bg-white rounded-xl">
                  No bookings found
                </div>
              ) : (
                bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl p-4 border border-black/10 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {booking.image && (
                          <img 
                            src={booking.image} 
                            alt="" 
                            className="w-12 h-12 rounded-lg object-cover" 
                          />
                        )}
                        <div>
                          <p className="text-[#20130b] font-semibold text-sm">
                            {booking.fieldName}
                          </p>
                          <p className="text-[#575757] text-xs">
                            {booking.ownerName}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        booking.status === 'COMPLETED' ? 'bg-[#3a6b22]/10 text-[#3a6b22] border-[#3a6b22]/12' :
                        booking.status === 'CONFIRMED' ? 'bg-[#8fb366]/10 text-[#8fb366] border-[#8fb366]/12' :
                        booking.status === 'PENDING' ? 'bg-[#f6bd01]/10 text-[#ffbd00] border-[#ffcc26]/16' :
                        'bg-red-50 text-red-500 border-red-200'
                      }`}>
                        {booking.status === 'COMPLETED' ? 'Completed' :
                         booking.status === 'CONFIRMED' ? 'Confirmed' :
                         booking.status === 'PENDING' ? 'Pending' : 'Cancelled'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-[#575757] text-xs">ID:</span>
                        <span className="text-[#20130b] ml-1">{booking.id.slice(0, 6).toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-[#575757] text-xs">Date:</span>
                        <span className="text-[#20130b] ml-1">{booking.date}</span>
                      </div>
                      <div>
                        <span className="text-[#575757] text-xs">Time:</span>
                        <span className="text-[#20130b] ml-1">{booking.timeSlot}</span>
                      </div>
                      <div>
                        <span className="text-[#575757] text-xs">Duration:</span>
                        <span className="text-[#20130b] ml-1">{booking.duration}</span>
                      </div>
                      <div>
                        <span className="text-[#575757] text-xs">Dogs:</span>
                        <span className="text-[#20130b] ml-1">{booking.dogs}</span>
                      </div>
                      <div>
                        <span className="text-[#575757] text-xs">Price:</span>
                        <span className="text-[#20130b] ml-1 font-semibold">${booking.price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[#575757] text-xs">
                        Recurring: {booking.recurring}
                      </span>
                      <button 
                        onClick={() => router.push(`/bookings/${booking.id}`)}
                        className="bg-[#3a6b22] hover:bg-[#2d5419] transition-colors text-white text-xs font-semibold px-4 py-2 rounded-full"
                      >
                        View Detail
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}