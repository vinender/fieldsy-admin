import React, { useState, useEffect } from 'react';
import Spinner from '@/components/ui/Spinner';
import AdminLayout from '../components/Layout/AdminLayout';
import { useRouter } from 'next/router';
import { Edit, Search, DollarSign } from 'lucide-react';
import { useVerifyAdmin } from '@/hooks/useAuth';
import {
  useFieldOwners,
  useCommissionSettings,
  useUpdateFieldOwnerCommission,
  useUpdateDefaultCommission
} from '@/hooks/useFieldOwners';
import { useBlockUser, useUnblockUser } from '@/hooks/useUsers';
import ConfirmationModal from '@/components/modal/ConfirmationModal';

interface FieldOwner {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  commissionRate: number | null;
  effectiveCommissionRate: number;
  isUsingDefault: boolean;
  fieldsCount: number;
  createdAt: string;
  isBlocked: boolean;
  blockedAt?: string | null;
  blockReason?: string | null;
}

interface SystemSettings {
  id: string;
  defaultCommissionRate: number;
}

export default function FieldOwners() {
  const router = useRouter();
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<FieldOwner | null>(null);
  const [customRate, setCustomRate] = useState('');
  const [useDefault, setUseDefault] = useState(false);
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [newDefaultRate, setNewDefaultRate] = useState('');
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [ownerToToggle, setOwnerToToggle] = useState<FieldOwner | null>(null);

  // React Query hooks
  const { data: fieldOwnersData, isLoading: fieldOwnersLoading } = useFieldOwners(currentPage, 10, searchQuery);
  const { data: commissionData } = useCommissionSettings();
  const updateCommissionMutation = useUpdateFieldOwnerCommission();
  const updateDefaultMutation = useUpdateDefaultCommission();
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const fieldOwners = fieldOwnersData?.data?.fieldOwners || [];
  const totalPages = fieldOwnersData?.data?.pagination?.totalPages || 1;
  const defaultCommission = commissionData?.data?.defaultCommissionRate || fieldOwnersData?.data?.defaultCommissionRate || 20;

  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
    setCurrentPage(1);
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

  const handleEditCommission = (owner: FieldOwner) => {
    setSelectedOwner(owner);
    setCustomRate(owner.commissionRate?.toString() || '');
    setUseDefault(owner.isUsingDefault);
    setShowCommissionModal(true);
  };

  const handleSaveCommission = async () => {
    if (!selectedOwner) return;

    try {
      const data = useDefault
        ? { useDefault: true }
        : { commissionRate: parseFloat(customRate) };

      await updateCommissionMutation.mutateAsync({
        ownerId: selectedOwner.id,
        data
      });

      setShowCommissionModal(false);
    } catch (error) {
      console.error('Error updating commission:', error);
    }
  };

  const handleSaveDefaultCommission = async () => {
    try {
      await updateDefaultMutation.mutateAsync(parseFloat(newDefaultRate));
      setShowDefaultModal(false);
      setNewDefaultRate('');
    } catch (error) {
      console.error('Error updating default commission:', error);
    }
  };

  const handleToggleBlock = (owner: FieldOwner) => {
    setOwnerToToggle(owner);
    setShowBlockConfirmModal(true);
  };

  const confirmToggleBlock = async () => {
    if (!ownerToToggle) return;

    try {
      if (ownerToToggle.isBlocked) {
        await unblockUserMutation.mutateAsync(ownerToToggle.id);
      } else {
        await blockUserMutation.mutateAsync({
          userId: ownerToToggle.id,
          reason: 'Blocked by admin'
        });
      }
      setShowBlockConfirmModal(false);
      setOwnerToToggle(null);
    } catch (error) {
      console.error('Error toggling block status:', error);
    }
  };

  if (adminLoading) {
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
      <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Field Owners</h1>
            {/* <button
              onClick={() => {
                setNewDefaultRate(defaultCommission.toString());
                setShowDefaultModal(true);
              }}
              className="bg-green text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-hover flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Default Commission:</span>
              <span className="sm:hidden">Commission:</span> {defaultCommission}%
            </button> */}
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
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
                  disabled={fieldOwnersLoading}
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
                <button
                  onClick={() => {
                    setNewDefaultRate(defaultCommission.toString());
                    setShowDefaultModal(true);
                  }}
                  className="bg-green text-white px-3 sm:px-4 py-2.5 rounded-lg hover:bg-green-hover flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Default Commission:</span>
                  <span className="sm:hidden">Commission:</span> {defaultCommission}%
                </button>
              </div>
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-500">
                Showing results for &quot;{searchQuery}&quot;
              </p>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto lg:overflow-x-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fields
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Block/Unblock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fieldOwnersLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <Spinner size="lg" />
                        </div>
                      </td>
                    </tr>
                  ) : fieldOwners.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No field owners found
                      </td>
                    </tr>
                  ) : (
                    fieldOwners.map((owner) => (
                      <tr key={owner.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {owner.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {owner.userId ? `#${owner.userId}` : owner.id.slice(-6)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-table-text">{owner.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-table-text">{owner.fieldsCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {owner.effectiveCommissionRate}%
                            </span>
                            {owner.isUsingDefault && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                Default
                              </span>
                            )}
                            {!owner.isUsingDefault && (
                              <span className="px-2 py-1 text-xs bg-green-lighter text-green rounded">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${owner.isBlocked
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-lighter text-green'
                            }`}>
                            {owner.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleBlock(owner)}
                            disabled={blockUserMutation.isPending || unblockUserMutation.isPending}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${owner.isBlocked
                              ? 'bg-red focus:ring-red'
                              : 'bg-green focus:ring-green'
                              } ${blockUserMutation.isPending || unblockUserMutation.isPending
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                              }`}
                          >
                            <span
                              className={`${owner.isBlocked ? 'translate-x-1' : 'translate-x-6'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditCommission(owner)}
                            className="inline-flex items-center px-[20px] py-[10px] text-xs font-medium rounded-[40px] text-white bg-green hover:bg-green-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Commission
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {fieldOwnersLoading ? (
              <div className="bg-white rounded-lg p-6">
                <div className="flex justify-center">
                  <Spinner size="lg" />
                </div>
              </div>
            ) : fieldOwners.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                No field owners found
              </div>
            ) : (
              fieldOwners.map((owner) => (
                <div key={owner.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {owner.name || 'N/A'}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1">
                        ID: {owner.userId ? `#${owner.userId}` : owner.id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">{owner.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${owner.isBlocked
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-lighter text-green'
                        }`}>
                        {owner.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                      <button
                        onClick={() => handleToggleBlock(owner)}
                        disabled={blockUserMutation.isPending || unblockUserMutation.isPending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${owner.isBlocked
                          ? 'bg-red focus:ring-red'
                          : 'bg-green focus:ring-green'
                          } ${blockUserMutation.isPending || unblockUserMutation.isPending
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                          }`}
                      >
                        <span
                          className={`${owner.isBlocked ? 'translate-x-1' : 'translate-x-6'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500 block">Fields</span>
                      <span className="font-medium">{owner.fieldsCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Commission</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{owner.effectiveCommissionRate}%</span>
                        {owner.isUsingDefault ? (
                          <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            Default
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-xs bg-green-lighter text-green rounded">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEditCommission(owner)}
                    className="w-full text-green hover:text-green-hover flex items-center justify-center gap-1 py-2 border border-green-lighter rounded-lg hover:bg-green-lighter transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Commission
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Edit Commission Modal */}
        {showCommissionModal && selectedOwner && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
            <div className="relative top-20 mx-auto p-6 border-0 max-w-sm w-full shadow-xl rounded-xl bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-lighter rounded-lg">
                  <DollarSign className="w-5 h-5 text-green" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Edit Commission Rate
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedOwner.name || selectedOwner.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={useDefault}
                    onChange={(e) => setUseDefault(e.target.checked)}
                    className="rounded border-gray-300 text-green focus:ring-green"
                  />
                  <span className="text-sm font-medium">Use default commission rate ({defaultCommission}%)</span>
                </label>

                {!useDefault && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      step="1"
                      value={customRate}
                      onChange={(e) => {
                        // Enforce whole numbers only (no decimals)
                        const value = Math.floor(Number(e.target.value));
                        // Clamp between 1 and 50
                        const clampedValue = Math.max(1, Math.min(50, value));
                        setCustomRate(String(clampedValue));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green focus:border-green"
                      placeholder="Enter commission rate (1-50%)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be between 1% and 50% (whole numbers only)</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowCommissionModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCommission}
                  disabled={updateCommissionMutation.isPending || (!useDefault && !customRate)}
                  className="px-4 py-2 bg-green text-white rounded-md hover:bg-green-hover disabled:opacity-50"
                >
                  {updateCommissionMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Default Commission Modal */}
        {showDefaultModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
            <div className="relative top-20 mx-auto p-6 border-0 max-w-sm w-full shadow-xl rounded-xl bg-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-lighter rounded-lg">
                  <DollarSign className="w-5 h-5 text-green" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Update Default Commission Rate
                  </h3>
                  <p className="text-sm text-gray-600">
                    Applies to all field owners without custom rates
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={newDefaultRate}
                  onChange={(e) => {
                    // Enforce whole numbers only (no decimals)
                    const value = Math.floor(Number(e.target.value));
                    // Clamp between 1 and 50
                    const clampedValue = Math.max(1, Math.min(50, value));
                    setNewDefaultRate(String(clampedValue));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green focus:border-green"
                  placeholder="Enter default rate (1-50%)"
                />
                <p className="text-xs text-gray-500 mt-1">Must be between 1% and 50% (whole numbers only)</p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDefaultModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDefaultCommission}
                  disabled={updateDefaultMutation.isPending || !newDefaultRate}
                  className="px-4 py-2 bg-green text-white rounded-md hover:bg-green-hover disabled:opacity-50"
                >
                  {updateDefaultMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Block/Unblock Confirmation Modal */}
        <ConfirmationModal
          isOpen={showBlockConfirmModal}
          onClose={() => {
            setShowBlockConfirmModal(false);
            setOwnerToToggle(null);
          }}
          onConfirm={confirmToggleBlock}
          title={ownerToToggle?.isBlocked ? 'Unblock Field Owner' : 'Block Field Owner'}
          message={
            ownerToToggle?.isBlocked
              ? `Are you sure you want to unblock ${ownerToToggle?.name || ownerToToggle?.email}? They will be able to access their account and manage their fields again.`
              : `Are you sure you want to block ${ownerToToggle?.name || ownerToToggle?.email}? They will not be able to access their account or receive bookings.`
          }
          confirmText={ownerToToggle?.isBlocked ? 'Unblock' : 'Block'}
          isLoading={blockUserMutation.isPending || unblockUserMutation.isPending}
          variant={ownerToToggle?.isBlocked ? 'info' : 'danger'}
        />
      </div>
    </AdminLayout>
  );
}