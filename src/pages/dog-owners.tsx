import { useState, useEffect } from 'react';
import Spinner from '@/components/ui/Spinner';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useUsers, useBlockUser, useUnblockUser } from '@/hooks/useUsers';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { User, Search, Filter, Mail, Phone, Calendar, Shield, Dog } from 'lucide-react';
import { formatDate } from '@/lib/utils';
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
import ConfirmationModal from '@/components/modal/ConfirmationModal';

export default function DogOwners() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState<any>(null);
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: usersData, isLoading: usersLoading } = useUsers(page, 10, 'DOG_OWNER', searchQuery || undefined);
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
    setPage(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  const handleToggleBlock = (user: any) => {
    setUserToToggle(user);
    setShowBlockConfirmModal(true);
  };

  const confirmToggleBlock = async () => {
    if (!userToToggle) return;

    try {
      if (userToToggle.isBlocked) {
        await unblockUserMutation.mutateAsync(userToToggle.id);
      } else {
        await blockUserMutation.mutateAsync({
          userId: userToToggle.id,
          reason: 'Blocked by admin'
        });
      }
      setShowBlockConfirmModal(false);
      setUserToToggle(null);
    } catch (error) {
      console.error('Error toggling block status:', error);
    }
  };

  if (adminLoading || usersLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Spinner size="md" />
        </div>
      </AdminLayout>
    );
  }

  const filteredUsers = usersData?.users || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dog Owners</h1>
          <p className="text-gray-600 mt-1">Manage all dog owner accounts</p>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dog Owners</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{usersData?.total || 0}</p>
              </div>
              <Dog className="w-8 h-8 text-green" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {usersData?.users?.filter(u => u.emailVerified).length || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {Math.floor(Math.random() * 50) + 10}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div> */}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID (e.g. #1234)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={usersLoading}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-lg text-white bg-green hover:bg-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green transition-colors disabled:opacity-50"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-500">
              Showing results for &quot;{searchQuery}&quot; — {usersData?.total || 0} found
            </p>
          )}
        </div>

        {/* Users Table */}
        <TableContainer>
          {filteredUsers.length === 0 ? (
            <TableEmptyState message="No dog owners found" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-lighter flex items-center justify-center">
                              <User className="w-5 h-5 text-green" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'Unnamed User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.userId ? `#${user.userId}` : user.id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {user._count?.bookings || 0}
                      </TableCell>
                      <TableCell>
                        {user.emailVerified ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-lighter text-green">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Unverified
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBlocked
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-lighter text-green'
                          }`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/dog-owners/${user.id}`)}
                            className="inline-flex items-center px-[20px] py-[10px] text-xs font-medium rounded-[40px] text-white bg-green hover:bg-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={blockUserMutation.isPending || unblockUserMutation.isPending}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${user.isBlocked
                                ? 'bg-gray-300 focus:ring-gray-500'
                                : 'bg-green focus:ring-green'
                              } ${blockUserMutation.isPending || unblockUserMutation.isPending
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                              }`}
                          >
                            <span
                              className={`${user.isBlocked ? 'translate-x-1' : 'translate-x-6'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {usersData && usersData.pages > 1 && (
                <TablePagination
                  currentPage={page}
                  totalPages={usersData.pages}
                  totalItems={usersData.total}
                  itemsPerPage={10}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </TableContainer>

        {/* Block/Unblock Confirmation Modal */}
        <ConfirmationModal
          isOpen={showBlockConfirmModal}
          onClose={() => {
            setShowBlockConfirmModal(false);
            setUserToToggle(null);
          }}
          onConfirm={confirmToggleBlock}
          title={userToToggle?.isBlocked ? 'Unblock Dog Owner' : 'Block Dog Owner'}
          message={
            userToToggle?.isBlocked
              ? `Are you sure you want to unblock ${userToToggle?.name || userToToggle?.email}? They will be able to access their account and make bookings again.`
              : `Are you sure you want to block ${userToToggle?.name || userToToggle?.email}? They will not be able to access their account or make new bookings.`
          }
          confirmText={userToToggle?.isBlocked ? 'Unblock' : 'Block'}
          isLoading={blockUserMutation.isPending || unblockUserMutation.isPending}
          variant={userToToggle?.isBlocked ? 'info' : 'danger'}
        />
      </div>
    </AdminLayout>
  );
}