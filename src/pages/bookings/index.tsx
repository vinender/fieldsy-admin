import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import BookingsTable from '@/components/Bookings/BookingsTable';
import FilterComponent from '@/components/Bookings/FilterComponent';
import { useBookings } from '@/hooks/useBookings';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { Search, Filter, Download } from 'lucide-react';
import { TableContainer, TablePagination } from '@/components/ui/table';

export default function Bookings() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    bookingStatus: 'All',
    dateRange: 'All'
  });
  const filterRef = useRef<HTMLDivElement>(null);
  
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings(page, 10);

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  // Lock body scroll when filter modal is open
  useEffect(() => {
    if (showFilter) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilter]);

  if (adminLoading || bookingsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  // Apply search and filters to bookings
  const filteredBookings = bookingsData?.bookings?.filter(booking => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        booking.id.toLowerCase().includes(search) ||
        booking.field.name.toLowerCase().includes(search) ||
        booking.user.name?.toLowerCase().includes(search) ||
        booking.user.email.toLowerCase().includes(search);
      
      if (!matchesSearch) return false;
    }

    // Booking status filter
    if (activeFilters.bookingStatus !== 'All') {
      if (booking.status.toLowerCase() !== activeFilters.bookingStatus.toLowerCase()) {
        return false;
      }
    }

    // Date range filter
    if (activeFilters.dateRange !== 'All') {
      const bookingDate = new Date(booking.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (activeFilters.dateRange) {
        case 'Today':
          if (bookingDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'This Week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          if (bookingDate < weekStart) return false;
          break;
        case 'This Month':
          if (bookingDate.getMonth() !== today.getMonth() || 
              bookingDate.getFullYear() !== today.getFullYear()) return false;
          break;
        case 'Last Month':
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          if (bookingDate.getMonth() !== lastMonth.getMonth() || 
              bookingDate.getFullYear() !== lastMonth.getFullYear()) return false;
          break;
      }
    }

    return true;
  }) || [];

  const handleFiltersChange = (newFilters: any) => {
    setActiveFilters(newFilters);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            <p className="text-gray-600 mt-1">Manage all bookings</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilter || Object.values(activeFilters).some(v => v !== 'All')
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                {Object.values(activeFilters).filter(v => v !== 'All').length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                    {Object.values(activeFilters).filter(v => v !== 'All').length}
                  </span>
                )}
              </button>
              
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <TableContainer>
          <BookingsTable bookings={filteredBookings} />
          
          {/* Pagination */}
          {bookingsData && bookingsData.pages > 1 && (
            <TablePagination
              currentPage={page}
              totalPages={bookingsData.pages}
              totalItems={bookingsData.total}
              itemsPerPage={10}
              onPageChange={setPage}
            />
          )}
        </TableContainer>
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowFilter(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div 
              ref={filterRef}
              className="pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <FilterComponent
                onFiltersChange={handleFiltersChange}
                initialFilters={activeFilters}
                showApplyButton={true}
                onClose={() => setShowFilter(false)}
              />
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}