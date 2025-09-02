import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { usePayments } from '@/hooks/usePayments';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { DollarSign, Search, Filter, CreditCard, TrendingUp, RefreshCw } from 'lucide-react';
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

export default function Payments() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments(page, 10);

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  if (adminLoading || paymentsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-lighter text-green',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.PENDING}`}>
        {status}
      </span>
    );
  };

  const totalRevenue = paymentsData?.payments?.reduce((sum, payment) => {
    if (payment.status === 'COMPLETED') return sum + payment.amount;
    return sum;
  }, 0) || 0;

  const totalRefunded = paymentsData?.payments?.reduce((sum, payment) => {
    if (payment.refundAmount) return sum + payment.refundAmount;
    return sum;
  }, 0) || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage all payment transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{paymentsData?.total || 0}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Refunded</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalRefunded)}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {paymentsData?.payments 
                    ? Math.round((paymentsData.payments.filter(p => p.status === 'COMPLETED').length / paymentsData.payments.length) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search payments..."
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

        {/* Payments Table */}
        <TableContainer>
          {!paymentsData?.payments || paymentsData.payments.length === 0 ? (
            <TableEmptyState message="No payments found" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsData.payments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-gray-900">
                        #{payment.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.booking?.field?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Booking #{payment.bookingId.slice(-6)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900">
                        {payment.booking?.user?.name || payment.booking?.user?.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                        {payment.refundAmount && (
                          <div className="text-xs text-red-600">
                            Refunded: {formatCurrency(payment.refundAmount)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(payment.createdAt)}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => router.push(`/bookings/${payment.bookingId}`)}
                          className="text-green hover:text-green-darker mr-3 transition-colors"
                        >
                          View
                        </button>
                        {payment.status === 'COMPLETED' && !payment.refundId && (
                          <button className="text-yellow-600 hover:text-yellow-900 transition-colors">
                            Refund
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {paymentsData.pages > 1 && (
                <TablePagination
                  currentPage={page}
                  totalPages={paymentsData.pages}
                  totalItems={paymentsData.total}
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