import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useFields, useToggleFieldBlocked, useToggleFieldApproved } from '@/hooks/useFields';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { MapPin, Search, Filter, X, AlertTriangle, Eye } from 'lucide-react';
import { formatCurrency, formatMonthYear } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import { Field } from '@/types';
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
  const [searchQuery, setSearchQuery] = useState(''); // Actual search query sent to API
  const [searchField, setSearchField] = useState<'all' | 'name' | 'owner'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    claimStatus: 'All',
    maxDogs: 'All',
    joinedDate: 'All',
    location: ''
  });
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedFieldForBlock, setSelectedFieldForBlock] = useState<Field | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedFieldForApprove, setSelectedFieldForApprove] = useState<Field | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: fieldsData, isLoading: fieldsLoading } = useFields(page, 10, searchQuery);
  const toggleBlockedMutation = useToggleFieldBlocked();
  const toggleApprovedMutation = useToggleFieldApproved();

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

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  // Add logging to track filter changes
  useEffect(() => {
    console.log('==================== ACTIVE FILTERS UPDATED ====================');
    console.log('Active filters:', JSON.stringify(activeFilters, null, 2));
    console.log('Total fields:', fieldsData?.fields?.length || 0);
    console.log('================================================================');
  }, [activeFilters, fieldsData?.fields?.length]);

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

    switch (range) {
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
    switch (range) {
      case '1-5 Dogs':
        return dogs >= 1 && dogs <= 5;
      case '6+ Dogs':
        return dogs >= 6;
      default:
        return true;
    }
  };

  const filteredFields = fieldsData?.fields?.filter(field => {
    // Note: Search is now handled by backend API, only apply other filters here

    // Location filter
    if (activeFilters.location && activeFilters.location.trim() !== '') {
      const locationSearch = activeFilters.location.toLowerCase().trim();
      const cityMatch = field.city?.toLowerCase().includes(locationSearch);
      console.log(`[Filter] Location - Field: ${field.name}, City: ${field.city}, Filter: ${locationSearch}, Match: ${cityMatch}`);
      if (!cityMatch) return false;
    }

    // Claim status filter
    if (activeFilters.claimStatus !== 'All') {
      const claimMatch = (activeFilters.claimStatus === 'Claimed' && field.isClaimed) ||
        (activeFilters.claimStatus === 'Not Claimed' && !field.isClaimed);
      console.log(`[Filter] Claim Status - Field: ${field.name}, isClaimed: ${field.isClaimed}, Filter: ${activeFilters.claimStatus}, Match: ${claimMatch}`);
      if (activeFilters.claimStatus === 'Claimed' && !field.isClaimed) return false;
      if (activeFilters.claimStatus === 'Not Claimed' && field.isClaimed) return false;
    }

    // Max dogs filter
    if (activeFilters.maxDogs !== 'All') {
      const dogsMatch = isInMaxDogsRange(field.maxDogs, activeFilters.maxDogs);
      console.log(`[Filter] Max Dogs - Field: ${field.name}, maxDogs: ${field.maxDogs}, Filter: ${activeFilters.maxDogs}, Match: ${dogsMatch}`);
      if (!dogsMatch) return false;
    }

    // Joined date filter
    if (activeFilters.joinedDate !== 'All') {
      const dateMatch = isWithinDateRange(field.createdAt, activeFilters.joinedDate);
      console.log(`[Filter] Joined Date - Field: ${field.name}, createdAt: ${field.createdAt}, Filter: ${activeFilters.joinedDate}, Match: ${dateMatch}`);
      if (!dateMatch) return false;
    }

    return true;
  }) || [];

  // Log filtering results
  console.log('==================== FILTERING RESULTS ====================');
  console.log('Total fields:', fieldsData?.fields?.length || 0);
  console.log('Filtered fields:', filteredFields.length);
  console.log('Active filters:', activeFilters);
  console.log('===========================================================');

  const handleBlockClick = (field: Field) => {
    setSelectedFieldForBlock(field);
    setBlockModalOpen(true);
  };

  const handleConfirmBlock = () => {
    if (selectedFieldForBlock) {
      toggleBlockedMutation.mutate(selectedFieldForBlock.id, {
        onSuccess: () => {
          setBlockModalOpen(false);
          setSelectedFieldForBlock(null);
        }
      });
    }
  };

  const handleCloseBlockModal = () => {
    setBlockModalOpen(false);
    setSelectedFieldForBlock(null);
  };

  const handleApproveClick = (field: Field) => {
    setSelectedFieldForApprove(field);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (selectedFieldForApprove) {
      toggleApprovedMutation.mutate(selectedFieldForApprove.id, {
        onSuccess: () => {
          setApproveModalOpen(false);
          setSelectedFieldForApprove(null);
        }
      });
    }
  };

  const handleCloseApproveModal = () => {
    setApproveModalOpen(false);
    setSelectedFieldForApprove(null);
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-3">
            <div className="flex-1 flex gap-2">
              {/* Search Field Dropdown */}
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as 'all' | 'name' | 'owner')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent bg-white text-sm"
              >
                <option value="all">All Fields</option>
                <option value="name">Field Name</option>
                <option value="owner">Owner Name</option>
              </select>

              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search by ${searchField === 'all' ? 'field or owner name' : searchField === 'name' ? 'field name' : 'owner name'}...`}
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

            <button
              data-filter-button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${showFilters || Object.values(activeFilters).some(v => v !== 'All')
                ? 'bg-greenborder-green text-green'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {Object.values(activeFilters).filter(v => v !== 'All').length > 0 && (
                <span className="ml-2 bg-green text-white text-xs px-2 py-0.5 rounded-full">
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
                      <TableHead>Field ID</TableHead>
                      <TableHead>Field & Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Field Price</TableHead>
                      {/* <TableHead>Earnings</TableHead> */}
                      <TableHead>Max Dogs</TableHead>
                      <TableHead>Entry Code</TableHead>
                      <TableHead>Joined On</TableHead>
                      <TableHead>Claimed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Block/Unblock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div className="text-sm font-medium text-gray-900 font-mono">{field.fieldId || field.id.slice(-6).toUpperCase()}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{field.name}</div>
                            <div className="text-sm text-gray-500">{field.owner.name || 'Unknown Owner'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{field.city}, {field.state}</div>
                          <div className="text-sm text-gray-500">{field.zipCode}</div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              £{(field.price30min || field.price || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              per 30 min/dog
                            </div>
                          </div>
                        </TableCell>
                        {/* <TableCell className="font-medium text-gray-900">
                          {formatCurrency(field.totalEarnings || 0)}
                        </TableCell> */}
                        <TableCell className="text-gray-500">
                          {field.maxDogs || 10}
                        </TableCell>
                        <TableCell>
                          {field.entryCode ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              {field.entryCode}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {field.joinedOn || formatMonthYear(field.createdAt)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${field.isClaimed ? 'bg-green text-white' : 'bg-yellow text-black'
                              }`}
                          >
                            {field.isClaimed ? 'Claimed' : 'Unclaimed'}
                          </span>
                        </TableCell>
                        {/* Status - Read Only (controlled by field owner) */}
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${field.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                              }`}
                          >
                            {field.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </TableCell>
                        {/* Approved - Admin controlled (only for submitted fields) */}
                        <TableCell>
                          {field.isSubmitted ? (
                            <button
                              onClick={() => handleApproveClick(field)}
                              disabled={toggleApprovedMutation.isPending}
                              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green focus:ring-offset-2 disabled:opacity-50"
                              style={{ backgroundColor: field.isApproved ? '#22c55e' : '#e5e7eb' }}
                              title={field.isApproved ? 'Field is approved - Click to unapprove' : 'Field is not approved - Click to approve'}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.isApproved ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">Not submitted</span>
                          )}
                        </TableCell>
                        {/* Block/Unblock - Admin controlled */}
                        <TableCell>
                          <button
                            onClick={() => handleBlockClick(field)}
                            disabled={toggleBlockedMutation.isPending || field.owner?.isBlocked === true}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: field.isBlocked ? '#ef4444' : '#e5e7eb' }}
                            title={
                              field.owner?.isBlocked === true
                                ? 'Field owner is blocked — unblock the owner first to toggle this field'
                                : field.isBlocked
                                  ? 'Field is blocked - Click to unblock'
                                  : 'Field is not blocked - Click to block'
                            }
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.isBlocked ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                          {field.owner?.isBlocked === true && (
                            <p className="text-[10px] text-red-500 mt-0.5 leading-tight">Owner blocked</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => router.push(`/fields/${field.fieldId || field.id}`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
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
      {
        showFilters && (
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
                    showApplyButton={true}
                    onClose={() => setShowFilters(false)}
                  />
                </Suspense>
              </div>
            </div>
          </>
        )
      }

      {/* Block/Unblock Confirmation Modal */}
      {blockModalOpen && selectedFieldForBlock && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleCloseBlockModal}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${selectedFieldForBlock.isBlocked ? 'bg-green' : 'bg-red-100'}`}>
                    <AlertTriangle className={`w-5 h-5 ${selectedFieldForBlock.isBlocked ? 'text-green' : 'text-red-600'}`} />
                  </div>
                  <h3 className="text-lg  font-semibold text-gray-900">
                    {selectedFieldForBlock.isBlocked ? 'Unblock Field' : 'Block Field'}
                  </h3>
                </div>
                <button
                  onClick={handleCloseBlockModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  {selectedFieldForBlock.isBlocked ? (
                    <>
                      Are you sure you want to <span className="font-semibold text-green">unblock</span> this field?
                      The field will become visible in public listings again.
                    </>
                  ) : (
                    <>
                      Are you sure you want to <span className="font-semibold text-red-600">block</span> this field?
                      The field will be hidden from all public listings.
                    </>
                  )}
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {selectedFieldForBlock.images && selectedFieldForBlock.images.length > 0 ? (
                      <img
                        src={selectedFieldForBlock.images[0]}
                        alt={selectedFieldForBlock.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedFieldForBlock.name}</p>
                      <p className="text-sm text-gray-500">{selectedFieldForBlock.city}, {selectedFieldForBlock.state}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={handleCloseBlockModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBlock}
                  disabled={toggleBlockedMutation.isPending}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedFieldForBlock.isBlocked
                    ? 'bg-green text-white hover:bg-green'
                    : 'bg-red text-white hover:bg-red'
                    }`}
                >
                  {toggleBlockedMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      {selectedFieldForBlock.isBlocked ? 'Unblocking...' : 'Blocking...'}
                    </span>
                  ) : (
                    selectedFieldForBlock.isBlocked ? 'Unblock Field' : 'Block Field'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Approve/Unapprove Confirmation Modal */}
      {approveModalOpen && selectedFieldForApprove && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleCloseApproveModal}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${selectedFieldForApprove.isApproved ? 'bg-amber-100' : 'bg-green'}`}>
                    <AlertTriangle className={`w-5 h-5 ${selectedFieldForApprove.isApproved ? 'text-amber-600' : 'text-white'}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedFieldForApprove.isApproved ? 'Unapprove Field' : 'Approve Field'}
                  </h3>
                </div>
                <button
                  onClick={handleCloseApproveModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  {selectedFieldForApprove.isApproved ? (
                    <>
                      Are you sure you want to <span className="font-semibold text-amber-600">unapprove</span> this field?
                      The field will be deactivated and hidden from public listings.
                    </>
                  ) : (
                    <>
                      Are you sure you want to <span className="font-semibold text-green">approve</span> this field?
                      The field will become visible in public listings and the owner will be notified.
                    </>
                  )}
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {selectedFieldForApprove.images && selectedFieldForApprove.images.length > 0 ? (
                      <img
                        src={selectedFieldForApprove.images[0]}
                        alt={selectedFieldForApprove.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedFieldForApprove.name}</p>
                      <p className="text-sm text-gray-500">{selectedFieldForApprove.city}, {selectedFieldForApprove.state}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-100">
                <button
                  onClick={handleCloseApproveModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmApprove}
                  disabled={toggleApprovedMutation.isPending}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedFieldForApprove.isApproved
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-green text-white hover:opacity-90'
                    }`}
                >
                  {toggleApprovedMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      {selectedFieldForApprove.isApproved ? 'Unapproving...' : 'Approving...'}
                    </span>
                  ) : (
                    selectedFieldForApprove.isApproved ? 'Unapprove Field' : 'Approve Field'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout >
  );
}