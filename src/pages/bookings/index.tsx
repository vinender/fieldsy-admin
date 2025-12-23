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
import { BookingsTableSkeleton } from '@/components/skeletons/AdminBookingsSkeleton';

export default function Bookings() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Actual search query sent to API
  const [searchField, setSearchField] = useState<'all' | 'booking' | 'user' | 'field'>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    bookingStatus: 'All',
    dateRange: 'All'
  });
  const filterRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: bookingsData, isLoading: bookingsLoading, isFetching } = useBookings(page, 10, {
    searchName: searchQuery,
    status: activeFilters.bookingStatus,
    dateRange: activeFilters.dateRange
  });

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  // Handle search execution
  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setPage(1);
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Reset search query when search term is cleared
  useEffect(() => {
    if (searchTerm === '' && searchQuery !== '') {
      setSearchQuery('');
      setPage(1);
    }
  }, [searchTerm, searchQuery]);

  // Reset to page 1 when searchQuery or filters change
  useEffect(() => {
    console.log('Filters changed, resetting to page 1:', { searchQuery, activeFilters });
    setPage(1);
  }, [searchQuery, activeFilters]);

  // Log when bookings data changes
  useEffect(() => {
    if (bookingsData) {
      console.log('Bookings data updated:', {
        total: bookingsData.total,
        pages: bookingsData.pages,
        bookingsCount: bookingsData.bookings?.length,
        searchQuery: searchQuery
      });
    }
  }, [bookingsData, searchQuery]);

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

  // Only show full-page loading on initial admin verification
  if (adminLoading) {
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-3">
            <div className="flex-1 flex gap-2">
              {/* Search Field Dropdown */}
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as 'all' | 'booking' | 'user' | 'field')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent bg-white text-sm"
              >
                <option value="all">All Fields</option>
                <option value="booking">Booking ID</option>
                <option value="user">User Name</option>
                <option value="field">Field Name</option>
              </select>

              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={`Search by ${searchField === 'all' ? 'booking ID, user, or field' : searchField === 'booking' ? 'booking ID' : searchField === 'user' ? 'user name' : 'field name'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent"
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-green text-white rounded-lg hover:bg-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green transition-colors font-medium"
              >
                Search
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilter || Object.values(activeFilters).some(v => v !== 'All')
                    ? 'border-green-500 bg-green-50 text-green'
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
        {bookingsLoading ? (
          <BookingsTableSkeleton />
        ) : (
          <TableContainer>
            <div className="relative">
              {/* Loading overlay for searches/filters - doesn't unmount the table */}
              {isFetching && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                  <Spinner size="lg" />
                </div>
              )}
              <BookingsTable bookings={bookings} />
            </div>

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
        )}
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