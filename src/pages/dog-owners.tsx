import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useUsers } from '@/hooks/useUsers';
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

export default function DogOwners() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: usersData, isLoading: usersLoading } = useUsers(page, 10, 'DOG_OWNER');

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  if (adminLoading || usersLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const filteredUsers = usersData?.users?.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search)
    );
  }) || [];

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
              <Dog className="w-8 h-8 text-green-600" />
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

        {/* Search and Filter */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search dog owners..."
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
        </div> */}

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
                            <div className="text-sm text-gray-500">ID: {user.id.slice(-6)}</div>
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
                      <TableCell className="text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <button 
                          onClick={() => router.push(`/dog-owners/${user.id}`)}
                          className="text-green hover:text-green-darker mr-3 transition-colors"
                        >
                          View
                        </button>
                        <button className="text-red-600 hover:text-red-900 transition-colors">Block</button>
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
      </div>
    </AdminLayout>
  );
}