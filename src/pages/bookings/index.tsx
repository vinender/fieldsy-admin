import { useState, useEffect, useRef } from 'react';
import Spinner from '@/components/ui/Spinner';
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    bookingStatus: 'All',
    dateRange: 'All'
  });
  const filterRef = useRef<HTMLDivElement>(null);

  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings(page, 10, {
    searchName: debouncedSearchTerm,
    status: activeFilters.bookingStatus,
    dateRange: activeFilters.dateRange
  });

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  // Debounce search term - only trigger when 3+ characters, empty, or valid booking ID
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedTerm = searchTerm.trim();
      // Check if it's a valid MongoDB ObjectId (booking ID)
      const isBookingId = /^[a-f0-9]{24}$/i.test(trimmedTerm);

      // Trigger search if: empty, 3+ characters, or valid booking ID
      if (trimmedTerm.length === 0 || trimmedTerm.length >= 3 || isBookingId) {
        console.log('Setting debounced search term:', searchTerm, isBookingId ? '(booking ID)' : '');
        setDebouncedSearchTerm(searchTerm);
      } else {
        console.log('Search term too short, not triggering API:', searchTerm);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when debounced search term or filters change
  useEffect(() => {
    console.log('Filters changed, resetting to page 1:', { debouncedSearchTerm, activeFilters });
    setPage(1);
  }, [debouncedSearchTerm, activeFilters]);

  // Log when bookings data changes
  useEffect(() => {
    if (bookingsData) {
      console.log('Bookings data updated:', {
        total: bookingsData.total,
        pages: bookingsData.pages,
        bookingsCount: bookingsData.bookings?.length,
        searchTerm: debouncedSearchTerm
      });
    }
  }, [bookingsData, debouncedSearchTerm]);

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
          <Spinner size="xl" />
        </div>
      </AdminLayout>
    );
  }

  // Bookings are now filtered server-side, just use the data directly
  const bookings = bookingsData?.bookings || [];

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
                  placeholder="Search by name or booking ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              {searchTerm.length > 0 && searchTerm.length < 3 && !/^[a-f0-9]{24}$/i.test(searchTerm) && (
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  Type at least 3 characters to search by name, or paste a full booking ID
                </p>
              )}
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
          <BookingsTable bookings={bookings} />
          
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