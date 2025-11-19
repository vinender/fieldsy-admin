import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
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

export default function Reports() {
  const router = useRouter();
  const { data: admin } = useVerifyAdmin();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (admin) {
      fetchReports();
    }
  }, [admin, page, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-reports/reports?page=${page}&limit=10${statusParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.data || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (loading && reports.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Reports</h1>
            <p className="text-gray-600 mt-1">Review and manage user reports</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {reports.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {reports.filter((r) => r.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dismissed</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {reports.filter((r) => r.status === 'dismissed').length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Reports</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        <TableContainer>
          {reports.length === 0 ? (
            <TableEmptyState message="No reports found" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reported User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {report.reporter?.image ? (
                            <img
                              src={report.reporter.image}
                              alt={report.reporter.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                              {report.reporter?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {report.reporter?.name}
                            </p>
                            <p className="text-xs text-gray-500">{report.reporter?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {report.reportedUser?.image ? (
                            <img
                              src={report.reportedUser.image}
                              alt={report.reportedUser.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                              {report.reportedUser?.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {report.reportedUser?.name}
                            </p>
                            <p className="text-xs text-gray-500">{report.reportedUser?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900 capitalize">
                          {report.reportedUser?.role?.toLowerCase().replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.reportOption}</p>
                          {report.reason && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {report.reason}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(report.status)}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              report.status
                            )}`}
                          >
                            {report.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => router.push(`/reports/${report.id}`)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <TablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
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
