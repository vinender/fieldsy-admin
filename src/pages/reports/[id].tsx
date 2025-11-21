import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: admin } = useVerifyAdmin();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    status: 'resolved' | 'dismissed';
  } | null>(null);

  useEffect(() => {
    if (admin && id) {
      fetchReportDetails();
    }
  }, [admin, id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-reports/reports/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReport(data.data);
        setReviewNotes(data.data.reviewNotes || '');
      } else {
        toast.error('Failed to fetch report details');
        router.push('/reports');
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Failed to fetch report details');
      router.push('/reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!confirmationModal) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-reports/reports/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: confirmationModal.status,
            reviewNotes: reviewNotes.trim() || undefined,
          }),
        }
      );

      if (response.ok) {
        toast.success(
          `Report ${confirmationModal.status === 'resolved' ? 'resolved' : 'dismissed'} successfully`
        );
        setConfirmationModal(null);
        fetchReportDetails();
      } else {
        toast.error('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green text-green border-green';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green" />;
      case 'dismissed':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="xl" />
        </div>
      </AdminLayout>
    );
  }

  if (!report) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Report not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/reports')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
            <p className="text-gray-600 mt-1">
              Submitted on {new Date(report.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Report Status</h2>
                <div className="flex items-center gap-2">
                  {getStatusIcon(report.status)}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmationModal({ isOpen: true, status: 'resolved' })}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-green hover:bg-green transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => setConfirmationModal({ isOpen: true, status: 'dismissed' })}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Dismiss Report
                  </button>
                </div>
              )}

              {report.status !== 'pending' && report.reviewedAt && (
                <div className="text-sm text-gray-600">
                  <p>
                    {report.status === 'resolved' ? 'Resolved' : 'Dismissed'} on{' '}
                    {new Date(report.reviewedAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Report Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Report Reason
                  </label>
                  <p className="text-gray-900 font-medium">{report.reportOption}</p>
                </div>

                {report.reason && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Additional Details
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{report.reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Notes */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Review Notes</h2>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about your review decision..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green/50 resize-none"
                rows={4}
                disabled={report.status !== 'pending'}
              />
              {report.status === 'pending' && (
                <p className="text-sm text-gray-500 mt-2">
                  These notes will be saved when you resolve or dismiss the report
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Reporter
              </h3>
              <div className="flex items-center gap-3 mb-4">
                {report.reporter?.image ? (
                  <img
                    src={report.reporter.image}
                    alt={report.reporter.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-600">
                    {report.reporter?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{report.reporter?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {report.reporter?.role?.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{report.reporter?.email}</span>
                </div>
                {report.reporter?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{report.reporter.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reported User Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100 border-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Reported User
              </h3>
              <div className="flex items-center gap-3 mb-4">
                {report.reportedUser?.image ? (
                  <img
                    src={report.reportedUser.image}
                    alt={report.reportedUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg text-gray-600">
                    {report.reportedUser?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{report.reportedUser?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {report.reportedUser?.role?.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{report.reportedUser?.email}</span>
                </div>
                {report.reportedUser?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{report.reportedUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{' '}
                    {new Date(report.reportedUser?.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (report.reportedUser?.role === 'FIELD_OWNER') {
                      router.push(`/field-owners?id=${report.reportedUser?.id}`);
                    } else {
                      router.push(`/dog-owners?id=${report.reportedUser?.id}`);
                    }
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  View User Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmationModal?.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-start mb-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    confirmationModal.status === 'resolved' ? 'bg-green' : 'bg-gray-100'
                  }`}
                >
                  {confirmationModal.status === 'resolved' ? (
                    <CheckCircle className="w-6 h-6 text-green" />
                  ) : (
                    <XCircle className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {confirmationModal.status === 'resolved' ? 'Resolve Report' : 'Dismiss Report'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {confirmationModal.status === 'resolved'
                      ? 'Are you sure you want to mark this report as resolved? This action confirms that appropriate action has been taken.'
                      : 'Are you sure you want to dismiss this report? This will mark it as reviewed but no action taken.'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reporter:</span>
                    <span className="font-medium text-gray-900">{report.reporter?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reported User:</span>
                    <span className="font-medium text-gray-900">{report.reportedUser?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmationModal(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${
                    confirmationModal.status === 'resolved'
                      ? 'bg-green hover:bg-green disabled:bg-green'
                      : 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400'
                  }`}
                >
                  {updating ? (
                    <div className="flex items-center justify-center">
                      <Spinner size="sm" className="mr-2" />
                      Processing...
                    </div>
                  ) : confirmationModal.status === 'resolved' ? (
                    'Resolve Report'
                  ) : (
                    'Dismiss Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
