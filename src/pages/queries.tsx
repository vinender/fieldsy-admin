import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import {
  useContactQueries,
  useQueryStatusCounts,
  useUpdateContactQuery,
  useDeleteContactQuery,
  ContactQuery
} from '@/hooks/useContactQueries';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { Search, Eye, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { AdminQueriesPageSkeleton } from '@/components/skeletons/AdminQueriesSkeleton';
import QueryDetailsModal from '@/components/modal/QueryDetailsModal';
import DeleteQueryModal from '@/components/modal/DeleteQueryModal';
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

// Status Badge Component
interface StatusBadgeProps {
  status: 'new' | 'in-progress' | 'resolved';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'resolved':
        return 'bg-green-100 text-green border border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'new':
        return 'New';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {getStatusLabel()}
    </span>
  );
};

export default function Queries() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<ContactQuery | null>(null);

  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: queriesData, isLoading: queriesLoading } = useContactQueries(
    page,
    10,
    activeTab,
    searchTerm
  );
  const { data: statusCounts } = useQueryStatusCounts();
  const updateMutation = useUpdateContactQuery();
  const deleteMutation = useDeleteContactQuery();

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  // Show full page skeleton while checking admin auth
  if (adminLoading) {
    return (
      <AdminLayout>
        <AdminQueriesPageSkeleton />
      </AdminLayout>
    );
  }

  const handleViewDetails = (query: ContactQuery) => {
    setSelectedQuery(query);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = async (status: string, notes?: string) => {
    if (!selectedQuery) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedQuery.id,
        status,
        adminNotes: notes
      });
      setIsDetailsModalOpen(false);
      setSelectedQuery(null);
    } catch (error) {
      console.error('Failed to update query:', error);
    }
  };

  const handleDeleteClick = (query: ContactQuery) => {
    setQueryToDelete(query);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!queryToDelete) return;

    try {
      await deleteMutation.mutateAsync(queryToDelete.id);
      setIsDeleteModalOpen(false);
      setQueryToDelete(null);
    } catch (error) {
      console.error('Failed to delete query:', error);
    }
  };

  const tabs = [
    { name: 'All', count: statusCounts?.all || 0 },
    { name: 'New', count: statusCounts?.new || 0 },
    { name: 'In Progress', count: statusCounts?.inProgress || 0 },
    { name: 'Resolved', count: statusCounts?.resolved || 0 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Queries</h1>
          <p className="text-gray-600 mt-1">Manage user queries and support requests</p>
        </div>

        {/* Status Tabs */}
        <div className="bg-white w-full flex items-center justify-between rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => {
                  setActiveTab(tab.name);
                  setPage(1); // Reset to first page when changing tabs
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.name
                    ? 'bg-[#3A6B22] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className={activeTab === tab.name ? 'text-white' : 'text-gray-700'}>
                  {tab.name}
                </span>
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.name
                      ? 'bg-[#2e5519] text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
            {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm  p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page when searching
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        </div>

       

        {/* Queries Table */}
        {queriesLoading ? (
          <AdminQueriesPageSkeleton />
        ) : (
          <TableContainer>
            {!queriesData?.queries || queriesData.queries.length === 0 ? (
              <TableEmptyState message="No queries found" />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queriesData.queries.map((query) => (
                      <TableRow key={query.id}>
                        <TableCell>
                          <div className="text-sm font-medium text-gray-900">{query.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">{query.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {query.phone || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {query.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={query.status} />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {formatDate(query.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(query)}
                              className="inline-flex items-center px-4 py-2 text-xs font-medium rounded-full text-white bg-[#3A6B22] hover:bg-[#2e5519] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1 text-white" />
                              <span className="text-white">View Details</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(query)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete query"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {queriesData && queriesData.pages > 1 && (
                  <TablePagination
                    currentPage={page}
                    totalPages={queriesData.pages}
                    totalItems={queriesData.total}
                    itemsPerPage={10}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </TableContainer>
        )}
      </div>

      {/* Query Details Modal */}
      {selectedQuery && (
        <QueryDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedQuery(null);
          }}
          query={selectedQuery}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {queryToDelete && (
        <DeleteQueryModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setQueryToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          queryName={queryToDelete.name}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}
