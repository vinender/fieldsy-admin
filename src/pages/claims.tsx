import { useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { useClaims, useUpdateClaimStatus } from '@/hooks/useClaims';
import { FileText, Eye, CheckCircle, XCircle, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import DocumentViewerModal from '@/components/modal/DocumentViewerModal';
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
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function Claims() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    claimId: string;
    status: 'APPROVED' | 'REJECTED';
    claimantName: string;
    fieldName: string;
  } | null>(null);

  const { data: admin } = useVerifyAdmin();
  const { data: claimsData, isLoading: claimsLoading, refetch } = useClaims(page, 10);
  const updateClaimStatus = useUpdateClaimStatus();

  const handleViewDocuments = (claim: any) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  const handleViewDocument = (documentUrl: string) => {
    setSelectedDocument(documentUrl);
  };

  const openConfirmationModal = (claim: any, status: 'APPROVED' | 'REJECTED') => {
    setConfirmationModal({
      isOpen: true,
      claimId: claim.id,
      status,
      claimantName: claim.fullName,
      fieldName: claim.field?.name || 'Unknown Field',
    });
  };

  const handleStatusUpdate = async () => {
    if (!confirmationModal) return;

    try {
      await updateClaimStatus.mutateAsync({
        claimId: confirmationModal.claimId,
        status: confirmationModal.status,
      });
      setConfirmationModal(null);
      refetch();
    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (claimsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Spinner size="md" />
        </div>
      </AdminLayout>
    );
  }

  const claims = claimsData?.claims || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Field Claims</h1>
          <p className="text-gray-600 mt-1">Manage field ownership claims submitted by users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{claimsData?.total || 0}</p>
              </div>
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {claims.filter(c => c.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green mt-1">
                  {claims.filter(c => c.status === 'APPROVED').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {claims.filter(c => c.status === 'REJECTED').length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>
        </div>

        {/* Claims Table */}
        <TableContainer>
          {claims.length === 0 ? (
            <TableEmptyState message="No claims found" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Claimant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Legal Owner</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {claim.field?.name || 'Unknown Field'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {claim.field?.city}, {claim.field?.state}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">{claim.fullName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-900">{claim.email}</div>
                          <div className="text-gray-500">
                            {claim.phoneCode} {claim.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          claim.isLegalOwner ? 'bg-green-100 text-green' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {claim.isLegalOwner ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleViewDocuments(claim)}
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{claim.documents?.length || 0} files</span>
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(claim.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(claim.status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                            {claim.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {/* <button
                            onClick={() => handleViewDocuments(claim)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button> */}
                          {claim.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => openConfirmationModal(claim, 'APPROVED')}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-green hover:bg-green transition-colors shadow-sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => openConfirmationModal(claim, 'REJECTED')}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-red hover:bg-red transition-colors shadow-sm"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {claimsData && claimsData.pages > 1 && (
                <TablePagination
                  currentPage={page}
                  totalPages={claimsData.pages}
                  totalItems={claimsData.total}
                  itemsPerPage={10}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </TableContainer>

        {/* Document Viewer Modal */}
        {isModalOpen && selectedClaim && (
          <DocumentViewerModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedDocument('');
            }}
            claim={selectedClaim}
            selectedDocument={selectedDocument}
            onDocumentSelect={handleViewDocument}
          />
        )}

        {/* Confirmation Modal */}
        {confirmationModal?.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex items-start mb-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  confirmationModal.status === 'APPROVED' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {confirmationModal.status === 'APPROVED' ? (
                    <CheckCircle className="w-6 h-6 text-green" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {confirmationModal.status === 'APPROVED' ? 'Approve Claim' : 'Reject Claim'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {confirmationModal.status === 'APPROVED'
                      ? 'Are you sure you want to approve this claim? This will create a field owner account and mark the field as claimed.'
                      : 'Are you sure you want to reject this claim? This action cannot be undone.'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Claimant:</span>
                    <span className="font-medium text-gray-900">{confirmationModal.claimantName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Field:</span>
                    <span className="font-medium text-gray-900">{confirmationModal.fieldName}</span>
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
                  disabled={updateClaimStatus.isPending}
                  className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${
                    confirmationModal.status === 'APPROVED'
                      ? 'bg-green hover:bg-green disabled:bg-green'
                      : 'bg-red hover:bg-red disabled:bg-red'
                  }`}
                >
                  {updateClaimStatus.isPending ? (
                    <div className="flex items-center justify-center">
                      <Spinner size="sm" className="mr-2" />
                      Processing...
                    </div>
                  ) : (
                    confirmationModal.status === 'APPROVED' ? 'Approve Claim' : 'Reject Claim'
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