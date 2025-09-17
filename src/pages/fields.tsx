import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useFields, useToggleFieldStatus } from '@/hooks/useFields';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { MapPin, Search, Filter } from 'lucide-react';
import { formatCurrency, formatMonthYear } from '@/lib/utils';
import { 
  FieldsTableSkeleton,
  AdminFieldsPageSkeleton 
} from '@/components/skeletons/AdminFieldsSkeleton';

// Lazy load the filter component
const FieldsFilterComponent = dynamic(
  () => import('@/components/Fields/FieldsFilterComponent'),
  { 
    loading: () => <div className="w-[320px] bg-white p-4 rounded-2xl shadow-lg animate-pulse h-96" />,
    ssr: false 
  }
);
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableEmptyState,
  TablePagination,
} from '@/components/ui/table';

export default function Fields() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    claimStatus: 'All',
    maxDogs: 'All',
    joinedDate: 'All',
    location: ''
  });
  const filterRef = useRef<HTMLDivElement>(null);
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: fieldsData, isLoading: fieldsLoading } = useFields(page, 10);
  const toggleStatusMutation = useToggleFieldStatus();

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  // Lock body scroll when filter modal is open
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilters]);

  // Show full page skeleton while checking admin auth
  if (adminLoading) {
    return (
      <AdminLayout>
        <AdminFieldsPageSkeleton />
      </AdminLayout>
    );
  }

  // Helper function to check if a date falls within a range
  const isWithinDateRange = (dateStr: string, range: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    switch(range) {
      case 'This Month':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'Last 3 Months':
        const threeMonthsAgo = new Date(now.getTime() - (90 * dayInMs));
        return date >= threeMonthsAgo;
      default:
        return true;
    }
  };

  // Helper function to check max dogs range
  const isInMaxDogsRange = (maxDogs: number | undefined, range: string) => {
    const dogs = maxDogs || 10; // Default to 10 if not specified
    switch(range) {
      case '1-5 Dogs':
        return dogs >= 1 && dogs <= 5;
      case '6+ Dogs':
        return dogs >= 6;
      default:
        return true;
    }
  };

  const filteredFields = fieldsData?.fields?.filter(field => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = (
        field.name?.toLowerCase().includes(search) ||
        field.address?.toLowerCase().includes(search) ||
        field.city?.toLowerCase().includes(search) ||
        field.owner.name?.toLowerCase().includes(search)
      );
      if (!matchesSearch) return false;
    }

    // Location filter
    if (activeFilters.location && activeFilters.location.trim() !== '') {
      const locationSearch = activeFilters.location.toLowerCase().trim();
      const cityMatch = field.city?.toLowerCase().includes(locationSearch);
      if (!cityMatch) return false;
    }

    // Claim status filter
    if (activeFilters.claimStatus !== 'All') {
      if (activeFilters.claimStatus === 'Claimed' && !field.isClaimed) return false;
      if (activeFilters.claimStatus === 'Not Claimed' && field.isClaimed) return false;
    }

    // Max dogs filter
    if (activeFilters.maxDogs !== 'All') {
      if (!isInMaxDogsRange(field.maxDogs, activeFilters.maxDogs)) return false;
    }

    // Joined date filter
    if (activeFilters.joinedDate !== 'All') {
      if (!isWithinDateRange(field.createdAt, activeFilters.joinedDate)) return false;
    }

    return true;
  }) || [];

  const handleToggleStatus = (fieldId: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ fieldId, isActive: !currentStatus });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Progressive loading: Header loads first */}
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fields</h1>
          <p className="text-gray-600 mt-1">Manage all fields</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <button 
              data-filter-button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters || Object.values(activeFilters).some(v => v !== 'All')
                  ? 'bg-green-50 border-green-600 text-green-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {Object.values(activeFilters).filter(v => v !== 'All').length > 0 && (
                <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {Object.values(activeFilters).filter(v => v !== 'All').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Fields Table */}
        {fieldsLoading ? (
          <FieldsTableSkeleton />
        ) : (
        <TableContainer>
          {filteredFields.length === 0 ? (
            <TableEmptyState message="No fields found" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field & Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Field Price</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Max Dogs</TableHead>
                    <TableHead>Joined On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {/* Field Image */}
                          <div className="flex-shrink-0">
                            {field.images && field.images.length > 0 ? (
                              <img 
                                src={field.images[0]} 
                                alt={field.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          {/* Field Name and Owner */}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{field.name}</div>
                            <div className="text-sm text-gray-500">{field.owner.name || 'Unknown Owner'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">{field.city}, {field.state}</div>
                        <div className="text-sm text-gray-500">{field.zipCode}</div>
                      </TableCell>
              
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            ${field.price || field.pricePerHour || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            per {field.bookingDuration === '30min' ? '30 min' : field.bookingDuration || '1 hour'} / {field.maxDogs || 10} dogs
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {field._count?.bookings || 0}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {formatCurrency(field.totalEarnings || 0)}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {field.maxDogs || 10}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {field.joinedOn || formatMonthYear(field.createdAt)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggleStatus(field.id, field.isActive)}
                          className="flex items-center"
                        >
                          {field.isActive ? (
                            <div className="flex items-center   border-green text-green">
                           
                              <span className="ml-2 bg-light-green/20 px-5 py-1 rounded-[40px] border-green text-sm">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              
                              <span className="ml-2 text-sm">Inactive</span>
                            </div>
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <button 
                          onClick={() => router.push(`/fields/${field.id}`)}
                          className="inline-flex items-center px-[20px] py-[10px]  text-xs font-medium rounded-[40px] text-white bg-green hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green transition-colors"

                        >
                         View Detail
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {fieldsData && fieldsData.pages > 1 && (
                <TablePagination
                  currentPage={page}
                  totalPages={fieldsData.pages}
                  totalItems={fieldsData.total}
                  itemsPerPage={10}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </TableContainer>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowFilters(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div 
              ref={filterRef}
              className="pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Suspense fallback={<div className="w-[320px] bg-white p-4 rounded-2xl shadow-lg animate-pulse h-96" />}>
                <FieldsFilterComponent
                  onFiltersChange={setActiveFilters}
                  initialFilters={activeFilters}
                  onClose={() => setShowFilters(false)}
                />
              </Suspense>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}