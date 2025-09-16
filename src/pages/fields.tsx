import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useFields, useToggleFieldStatus } from '@/hooks/useFields';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { MapPin, Search, Filter, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
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
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: fieldsData, isLoading: fieldsLoading } = useFields(page, 10);
  const toggleStatusMutation = useToggleFieldStatus();

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  if (adminLoading || fieldsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const filteredFields = fieldsData?.fields?.filter(field => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      field.name.toLowerCase().includes(search) ||
      field.address.toLowerCase().includes(search) ||
      field.city.toLowerCase().includes(search) ||
      field.owner.name?.toLowerCase().includes(search)
    );
  }) || [];

  const handleToggleStatus = (fieldId: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ fieldId, isActive: !currentStatus });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
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
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Fields Table */}
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
                    <TableHead>Price</TableHead>
                    <TableHead>Bookings</TableHead>
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
              
                      <TableCell className="font-medium text-gray-900">
                        {formatCurrency(field.price)}/hr
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {field._count?.bookings || 0}
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
      </div>
    </AdminLayout>
  );
}