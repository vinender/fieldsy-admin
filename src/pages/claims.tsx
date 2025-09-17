import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { useClaims, useUpdateClaimStatus } from '@/hooks/useClaims';
import { FileText, Eye, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
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

  const handleStatusUpdate = async (claimId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateClaimStatus.mutateAsync({
        claimId,
        status,
      });
      refetch();
    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (claimsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {claims.filter(c => c.status === 'APPROVED').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
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
                          claim.isLegalOwner ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
                          <button
                            onClick={() => handleViewDocuments(claim)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          {claim.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(claim.id, 'APPROVED')}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg text-green-600 bg-green-50 hover:bg-green-100"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(claim.id, 'REJECTED')}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100"
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
      </div>
    </AdminLayout>
  );
}