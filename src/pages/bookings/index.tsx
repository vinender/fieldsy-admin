import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import BookingsTable from '@/components/Bookings/BookingsTable';
import { useBookings } from '@/hooks/useBookings';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { Search, Filter, Download } from 'lucide-react';
import { TableContainer, TablePagination } from '@/components/ui/table';

export default function Bookings() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings(page, 10);

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  if (adminLoading || bookingsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const filteredBookings = bookingsData?.bookings?.filter(booking => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      booking.id.toLowerCase().includes(search) ||
      booking.field.name.toLowerCase().includes(search) ||
      booking.user.name?.toLowerCase().includes(search) ||
      booking.user.email.toLowerCase().includes(search)
    );
  }) || [];

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
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
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
    </AdminLayout>
  );
}