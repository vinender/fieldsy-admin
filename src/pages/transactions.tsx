import { useState, useEffect, useRef } from 'react';
import Spinner from '@/components/ui/Spinner';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, RefreshCw, X, ChevronDown, ExternalLink, Eye, CheckCircle, Clock, AlertCircle, Banknote, ArrowRight, CreditCard, Building2 } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  TableEmptyState,
} from '@/components/ui/table';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency, formatDate } from '@/lib/utils';

type TransactionType = 'ALL' | 'PAYMENT' | 'REFUND' | 'PAYOUT' | 'TRANSFER';
type TransactionStatus = 'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  netAmount?: number;
  platformFee?: number;
  commissionRate?: number;
  status: string;
  description?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeBalanceTransactionId?: string;
  stripeRefundId?: string;
  stripeTransferId?: string;
  stripePayoutId?: string;
  connectedAccountId?: string;
  createdAt: string;
  // Lifecycle stage tracking
  lifecycleStage?: string;
  paymentReceivedAt?: string;
  fundsAvailableAt?: string;
  transferredAt?: string;
  payoutInitiatedAt?: string;
  payoutCompletedAt?: string;
  refundedAt?: string;
  booking?: {
    id: string;
    date: string;
    timeSlot?: string;
    field?: {
      id: string;
      name: string;
      owner?: {
        id: string;
        name: string;
        email: string;
      };
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  fieldOwner?: {
    id: string;
    name: string;
    email: string;
  };
  // For payouts
  stripeAccountId?: string;
  arrivalDate?: string;
  failureCode?: string;
  failureMessage?: string;
  // For transfers
  destination?: string;
}

// Lifecycle stage definitions
const LIFECYCLE_STAGES = {
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  FUNDS_PENDING: 'FUNDS_PENDING',
  FUNDS_AVAILABLE: 'FUNDS_AVAILABLE',
  TRANSFERRED: 'TRANSFERRED',
  PAYOUT_INITIATED: 'PAYOUT_INITIATED',
  PAYOUT_COMPLETED: 'PAYOUT_COMPLETED',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
} as const;

const getLifecycleStageInfo = (stage?: string) => {
  switch (stage) {
    case LIFECYCLE_STAGES.PAYMENT_RECEIVED:
      return { label: 'Payment Received', color: 'text-green', bgColor: 'bg-green', icon: CreditCard };
    case LIFECYCLE_STAGES.FUNDS_PENDING:
      return { label: 'Funds Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock };
    case LIFECYCLE_STAGES.FUNDS_AVAILABLE:
      return { label: 'Funds Available', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Banknote };
    case LIFECYCLE_STAGES.TRANSFERRED:
      return { label: 'Transferred', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: ArrowRight };
    case LIFECYCLE_STAGES.PAYOUT_INITIATED:
      return { label: 'Payout Initiated', color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: Building2 };
    case LIFECYCLE_STAGES.PAYOUT_COMPLETED:
      return { label: 'Payout Complete', color: 'text-green', bgColor: 'bg-green', icon: CheckCircle };
    case LIFECYCLE_STAGES.REFUNDED:
      return { label: 'Refunded', color: 'text-red-600', bgColor: 'bg-red-100', icon: RefreshCw };
    case LIFECYCLE_STAGES.FAILED:
      return { label: 'Failed', color: 'text-red-700', bgColor: 'bg-red-200', icon: AlertCircle };
    case LIFECYCLE_STAGES.CANCELLED:
      return { label: 'Cancelled', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: X };
    default:
      return { label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock };
  }
};

const getLifecycleStageOrder = (stage?: string): number => {
  const order: Record<string, number> = {
    [LIFECYCLE_STAGES.PAYMENT_RECEIVED]: 1,
    [LIFECYCLE_STAGES.FUNDS_PENDING]: 2,
    [LIFECYCLE_STAGES.FUNDS_AVAILABLE]: 3,
    [LIFECYCLE_STAGES.TRANSFERRED]: 4,
    [LIFECYCLE_STAGES.PAYOUT_INITIATED]: 5,
    [LIFECYCLE_STAGES.PAYOUT_COMPLETED]: 6,
    [LIFECYCLE_STAGES.REFUNDED]: -1,
    [LIFECYCLE_STAGES.FAILED]: -2,
    [LIFECYCLE_STAGES.CANCELLED]: -3,
  };
  return order[stage || ''] || 0;
};

// Lifecycle Timeline Component
const LifecycleTimeline = ({ transaction }: { transaction: Transaction }) => {
  const stages = [
    { key: LIFECYCLE_STAGES.PAYMENT_RECEIVED, timestamp: transaction.paymentReceivedAt },
    { key: LIFECYCLE_STAGES.FUNDS_PENDING, timestamp: null },
    { key: LIFECYCLE_STAGES.FUNDS_AVAILABLE, timestamp: transaction.fundsAvailableAt },
    { key: LIFECYCLE_STAGES.TRANSFERRED, timestamp: transaction.transferredAt },
    { key: LIFECYCLE_STAGES.PAYOUT_INITIATED, timestamp: transaction.payoutInitiatedAt },
    { key: LIFECYCLE_STAGES.PAYOUT_COMPLETED, timestamp: transaction.payoutCompletedAt },
  ];

  const currentStageOrder = getLifecycleStageOrder(transaction.lifecycleStage);
  const isTerminal = ['REFUNDED', 'FAILED', 'CANCELLED'].includes(transaction.lifecycleStage || '');

  if (isTerminal) {
    const stageInfo = getLifecycleStageInfo(transaction.lifecycleStage);
    const StageIcon = stageInfo.icon;
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${stageInfo.bgColor}`}>
        <StageIcon className={`w-5 h-5 ${stageInfo.color}`} />
        <span className={`font-medium ${stageInfo.color}`}>{stageInfo.label}</span>
        {transaction.refundedAt && (
          <span className="text-xs text-gray-500">
            {formatDate(transaction.refundedAt)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stages.map((stage, index) => {
        const stageInfo = getLifecycleStageInfo(stage.key);
        const StageIcon = stageInfo.icon;
        const stageOrder = getLifecycleStageOrder(stage.key);
        const isCompleted = currentStageOrder >= stageOrder;
        const isCurrent = transaction.lifecycleStage === stage.key;

        return (
          <div key={stage.key} className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isCompleted ? stageInfo.bgColor : 'bg-gray-100'
            }`}>
              <StageIcon className={`w-4 h-4 ${isCompleted ? stageInfo.color : 'text-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                {stageInfo.label}
                {isCurrent && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-green text-green">
                    Current
                  </span>
                )}
              </p>
              {stage.timestamp && (
                <p className="text-xs text-gray-500">{formatDate(stage.timestamp)}</p>
              )}
            </div>
            {index < stages.length - 1 && (
              <div className={`w-px h-4 ml-4 ${isCompleted ? 'bg-green' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const getTypeIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'PAYMENT':
      return <ArrowDownLeft className="w-4 h-4 text-green" />;
    case 'REFUND':
      return <ArrowUpRight className="w-4 h-4 text-red-600" />;
    case 'PAYOUT':
      return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
    case 'TRANSFER':
      return <RefreshCw className="w-4 h-4 text-purple-600" />;
    default:
      return <RefreshCw className="w-4 h-4 text-gray-600" />;
  }
};

const getTypeBadge = (type: string) => {
  const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
  switch (type.toUpperCase()) {
    case 'PAYMENT':
      return `${baseClasses} bg-green text-green border border-green`;
    case 'REFUND':
      return `${baseClasses} bg-red-100 text-red-700 border border-red-200`;
    case 'PAYOUT':
      return `${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`;
    case 'TRANSFER':
      return `${baseClasses} bg-purple-100 text-purple-700 border border-purple-200`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
  }
};

const getStatusBadge = (status: string, type?: string) => {
  const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
  const upperStatus = status.toUpperCase();

  // Special handling for refunds - yellow background
  if (type?.toUpperCase() === 'REFUND') {
    if (upperStatus === 'COMPLETED' || upperStatus === 'SUCCEEDED') {
      return `${baseClasses} bg-yellow-200 text-yellow-800 border border-yellow-300`;
    }
    return `${baseClasses} bg-yellow-100 text-yellow-700 border border-yellow-200`;
  }

  switch (upperStatus) {
    case 'COMPLETED':
    case 'SUCCEEDED':
      return `${baseClasses} bg-green text-white border border-green`;
    case 'PAID':
      return `${baseClasses} bg-green text-white border border-green`;
    case 'PENDING':
      return `${baseClasses} bg-amber-100 text-amber-700 border border-amber-200`;
    case 'PROCESSING':
    case 'IN_TRANSIT':
      return `${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`;
    case 'FAILED':
      return `${baseClasses} bg-red-500 text-white border border-red-600`;
    case 'CANCELLED':
    case 'CANCELED':
      return `${baseClasses} bg-red-100 text-red-700 border border-red-200`;
    case 'REFUNDED':
      return `${baseClasses} bg-yellow-200 text-yellow-800 border border-yellow-300`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`;
  }
};

export default function Transactions() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    type: 'ALL' as TransactionType,
    status: 'ALL' as TransactionStatus,
    dateRange: 'ALL'
  });
  const filterRef = useRef<HTMLDivElement>(null);

  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: transactionsData, isLoading: transactionsLoading, refetch } = useTransactions(page, 20, {
    search: debouncedSearchTerm,
    type: activeFilters.type,
    status: activeFilters.status,
    dateRange: activeFilters.dateRange
  });

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length === 0 || searchTerm.trim().length >= 3) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, activeFilters]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showFilter || selectedTransaction) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFilter, selectedTransaction]);

  if (adminLoading || transactionsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="xl" />
        </div>
      </AdminLayout>
    );
  }

  const transactions = transactionsData?.transactions || [];
  const stats = transactionsData?.stats || {
    totalPayments: 0,
    totalRefunds: 0,
    totalPayouts: 0,
    totalTransfers: 0,
    netRevenue: 0
  };

  const handleApplyFilters = () => {
    setShowFilter(false);
  };

  const handleResetFilters = () => {
    setActiveFilters({
      type: 'ALL',
      status: 'ALL',
      dateRange: 'ALL'
    });
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v !== 'ALL').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">View all payments, refunds, payouts, and transfers</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="bg-green text-white px-4 py-2 rounded-lg hover:bg-green transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowDownLeft className="w-4 h-4 text-green" />
              <span className="text-sm text-gray-600">Payments</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalPayments)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-600">Refunds</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalRefunds)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Payouts</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalPayouts)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Transfers</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalTransfers)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-600">Platform Revenue</span>
            </div>
            <p className="text-xl font-bold text-green">{formatCurrency(stats.netRevenue)}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by user, field, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Quick Type Filters */}
              <div className="hidden md:flex items-center space-x-2">
                {(['ALL', 'PAYMENT', 'REFUND', 'PAYOUT', 'TRANSFER'] as TransactionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveFilters(prev => ({ ...prev, type }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      activeFilters.type === type
                        ? 'bg-green text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  activeFilterCount > 0
                    ? 'border-green bg-greentext-green'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-green text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <TableContainer>
          {transactions.length === 0 ? (
            <TableEmptyState message="No transactions found" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lifecycle</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Field / Description</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(transaction.type)}
                        <span className={getTypeBadge(transaction.type)}>
                          {transaction.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`font-medium ${
                          transaction.type === 'REFUND' || transaction.type === 'PAYOUT'
                            ? 'text-red-600'
                            : 'text-green'
                        }`}>
                          {transaction.type === 'REFUND' || transaction.type === 'PAYOUT' ? '-' : '+'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                        {transaction.netAmount && (
                          <span className="text-xs text-gray-500">
                            Net: {formatCurrency(transaction.netAmount)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={getStatusBadge(transaction.status, transaction.type)}>
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {transaction.lifecycleStage ? (
                        <div className="flex items-center space-x-1.5">
                          {(() => {
                            const stageInfo = getLifecycleStageInfo(transaction.lifecycleStage);
                            const StageIcon = stageInfo.icon;
                            return (
                              <>
                                <StageIcon className={`w-3.5 h-3.5 ${stageInfo.color}`} />
                                <span className={`text-xs font-medium ${stageInfo.color} ${stageInfo.bgColor} px-2 py-0.5 rounded-full`}>
                                  {stageInfo.label}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.user ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 truncate max-w-[150px]">
                            {transaction.user.name || 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">
                            {transaction.user.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-[200px]">
                        {transaction.booking?.field ? (
                          <>
                            <span className="font-medium text-gray-900 truncate">
                              {transaction.booking.field.name}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {transaction.booking.field.owner?.name || 'Unknown owner'}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 truncate">
                            {transaction.description || '-'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.platformFee ? (
                        <span className="text-green font-medium">
                          {formatCurrency(transaction.platformFee)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="p-2 text-gray-500 hover:text-green hover:bg-greenrounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {transactionsData && transactionsData.pages > 1 && (
            <TablePagination
              currentPage={page}
              totalPages={transactionsData.pages}
              totalItems={transactionsData.total}
              itemsPerPage={20}
              onPageChange={setPage}
            />
          )}
        </TableContainer>
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowFilter(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div
              ref={filterRef}
              className="pointer-events-auto bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filter Transactions</h3>
                <button
                  onClick={() => setShowFilter(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                  <select
                    value={activeFilters.type}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, type: e.target.value as TransactionType }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green"
                  >
                    <option value="ALL">All Types</option>
                    <option value="PAYMENT">Payments</option>
                    <option value="REFUND">Refunds</option>
                    <option value="PAYOUT">Payouts</option>
                    <option value="TRANSFER">Transfers</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={activeFilters.status}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, status: e.target.value as TransactionStatus }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={activeFilters.dateRange}
                    onChange={(e) => setActiveFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green"
                  >
                    <option value="ALL">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-2 bg-green text-white rounded-lg hover:bg-green transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedTransaction(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <div
              className="pointer-events-auto bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Transaction Summary */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(selectedTransaction.type)}
                    <div>
                      <span className={getTypeBadge(selectedTransaction.type)}>
                        {selectedTransaction.type}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(selectedTransaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      selectedTransaction.type === 'REFUND' || selectedTransaction.type === 'PAYOUT'
                        ? 'text-red-600'
                        : 'text-green'
                    }`}>
                      {selectedTransaction.type === 'REFUND' || selectedTransaction.type === 'PAYOUT' ? '-' : '+'}
                      {formatCurrency(Math.abs(selectedTransaction.amount))}
                    </p>
                    <span className={getStatusBadge(selectedTransaction.status, selectedTransaction.type)}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">Financial Breakdown</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Amount</span>
                      <span className="font-medium">{formatCurrency(selectedTransaction.amount)}</span>
                    </div>
                    {selectedTransaction.platformFee && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Fee</span>
                        <span className="font-medium text-green">
                          {formatCurrency(selectedTransaction.platformFee)}
                        </span>
                      </div>
                    )}
                    {selectedTransaction.netAmount && (
                      <div className="flex justify-between border-t pt-3">
                        <span className="text-gray-600">Net to Field Owner</span>
                        <span className="font-medium">{formatCurrency(selectedTransaction.netAmount)}</span>
                      </div>
                    )}
                    {selectedTransaction.commissionRate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission Rate</span>
                        <span className="font-medium">{selectedTransaction.commissionRate}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Lifecycle Timeline */}
                {selectedTransaction.type === 'PAYMENT' && selectedTransaction.lifecycleStage && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">Payment Lifecycle</h4>
                      <p className="text-xs text-gray-500 mt-1">Track the flow of funds from payment to field owner bank</p>
                    </div>
                    <div className="p-4">
                      <LifecycleTimeline transaction={selectedTransaction} />
                    </div>
                  </div>
                )}

                {/* User Info */}
                {selectedTransaction.user && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">Customer</h4>
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-gray-900">{selectedTransaction.user.name || 'N/A'}</p>
                      <p className="text-gray-600">{selectedTransaction.user.email}</p>
                    </div>
                  </div>
                )}

                {/* Booking/Field Info */}
                {selectedTransaction.booking?.field && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">Booking Details</h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Field</span>
                        <span className="font-medium">{selectedTransaction.booking.field.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Field Owner</span>
                        <span className="font-medium">{selectedTransaction.booking.field.owner?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium">{formatDate(selectedTransaction.booking.date)}</span>
                      </div>
                      {selectedTransaction.booking.timeSlot && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Slot</span>
                          <span className="font-medium">{selectedTransaction.booking.timeSlot}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stripe IDs */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">Stripe References</h4>
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedTransaction.id}</code>
                    </div>
                    {selectedTransaction.stripePaymentIntentId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Payment Intent</span>
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {selectedTransaction.stripePaymentIntentId.slice(0, 20)}...
                          </code>
                          <a
                            href={`https://dashboard.stripe.com/test/payments/${selectedTransaction.stripePaymentIntentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green hover:text-green"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.stripeRefundId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Refund ID</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {selectedTransaction.stripeRefundId}
                        </code>
                      </div>
                    )}
                    {selectedTransaction.stripePayoutId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Payout ID</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {selectedTransaction.stripePayoutId}
                        </code>
                      </div>
                    )}
                    {selectedTransaction.stripeTransferId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Transfer ID</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {selectedTransaction.stripeTransferId}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Failure Info (if applicable) */}
                {selectedTransaction.failureCode && (
                  <div className="border border-red-200 bg-red-50 rounded-xl overflow-hidden">
                    <div className="bg-red-100 px-4 py-3 border-b border-red-200">
                      <h4 className="font-medium text-red-900">Failure Details</h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-red-700">Error Code</span>
                        <code className="bg-red-100 px-2 py-1 rounded text-xs text-red-800">
                          {selectedTransaction.failureCode}
                        </code>
                      </div>
                      {selectedTransaction.failureMessage && (
                        <p className="text-red-700 text-sm">{selectedTransaction.failureMessage}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
