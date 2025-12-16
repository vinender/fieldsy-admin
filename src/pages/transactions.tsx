import { useState, useEffect, useRef } from 'react';
import Spinner from '@/components/ui/Spinner';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, X, ExternalLink, Eye, CheckCircle, Clock, AlertCircle, Banknote, ArrowRight, CreditCard, Building2 } from 'lucide-react';
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
import { useTransactions, useTransactionDetails } from '@/hooks/useTransactions';
import { formatCurrency, formatDate } from '@/lib/utils';

type TransactionType = 'ALL' | 'PAYMENT' | 'REFUND' | 'PAYOUT' | 'TRANSFER';
type TransactionStatus = 'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  stripeFee?: number;
  amountAfterStripeFee?: number;
  platformFee?: number; // What Fieldsy keeps
  fieldOwnerEarnings?: number; // What field owner receives
  commissionRate?: number; // Platform commission percentage
  status: string;
  description?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeBalanceTransactionId?: string;
  stripeRefundId?: string;
  stripeTransferId?: string;
  stripePayoutId?: string;
  connectedAccountId?: string;
  transferredAt?: string; // When transfer to connected account was made
  createdAt: string;
  // Lifecycle stage tracking
  lifecycleStage?: string;
  paymentReceivedAt?: string;
  fundsAvailableAt?: string;
  payoutInitiatedAt?: string;
  payoutCompletedAt?: string;
  refundedAt?: string;
  // Booking-centric fields
  bookingId?: string;
  hasRefund?: boolean;
  refundAmount?: number;
  refundStatus?: string;
  payoutStatus?: string;
  payoutReleasedAt?: string;
  booking?: {
    id: string;
    date: string;
    timeSlot?: string;
    startTime?: string;
    endTime?: string;
    numberOfDogs?: number;
    totalPrice?: number;
    status?: string;
    paymentStatus?: string;
    payoutStatus?: string;
    payoutReleasedAt?: string;
    cancellationReason?: string;
    cancelledAt?: string;
    createdAt?: string;
    repeatBooking?: string; // "none", "weekly", "monthly"
    subscriptionId?: string;
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
  // Payment breakdown
  paymentBreakdown?: {
    grossAmount: number;
    stripeProcessingFee: number;
    amountAfterStripe: number;
    platformCommission: number;
    fieldOwnerAmount: number;
    commissionRate: number;
  };
  // Related transactions for the same booking
  relatedTransactions?: {
    payment?: {
      id: string;
      amount: number;
      status: string;
      lifecycleStage?: string;
      createdAt: string;
      payoutCompletedAt?: string;
    };
    refund?: {
      id: string;
      amount: number;
      status: string;
      stripeRefundId?: string;
      createdAt: string;
      refundedAt?: string;
    };
  };
}

// Lifecycle stage definitions
const LIFECYCLE_STAGES = {
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  FUNDS_PENDING: 'FUNDS_PENDING',
  FUNDS_AVAILABLE: 'FUNDS_AVAILABLE',
  TRANSFERRED: 'TRANSFERRED',
  TRANSFER_FAILED: 'TRANSFER_FAILED',
  PAYOUT_INITIATED: 'PAYOUT_INITIATED',
  PAYOUT_COMPLETED: 'PAYOUT_COMPLETED',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
} as const;

const getLifecycleStageInfo = (stage?: string) => {
  switch (stage) {
    case LIFECYCLE_STAGES.PAYMENT_RECEIVED:
      return { label: 'Payment Received', color: 'text-white', bgColor: 'bg-green', icon: CreditCard };
    case LIFECYCLE_STAGES.FUNDS_PENDING:
      return { label: 'Funds Pending', color: 'text-yellow/80', bgColor: 'bg-yellow/20', icon: Clock };
    case LIFECYCLE_STAGES.FUNDS_AVAILABLE:
      return { label: 'Funds Available', color: 'text-blue-600', bgColor: 'bg-blue-600/20', icon: Banknote };
    case LIFECYCLE_STAGES.TRANSFERRED:
      return { label: 'Transferred', color: 'text-purple-600', bgColor: 'bg-purple-600/20', icon: ArrowRight };
    case LIFECYCLE_STAGES.TRANSFER_FAILED:
      return { label: 'Transfer Failed', color: 'text-red', bgColor: 'bg-red/10', icon: AlertCircle };
    case LIFECYCLE_STAGES.PAYOUT_INITIATED:
      return { label: 'Payout Initiated', color: 'text-indigo-600', bgColor: 'bg-indigo-600/20', icon: Building2 };
    case LIFECYCLE_STAGES.PAYOUT_COMPLETED:
      return { label: 'Payout Complete', color: 'text-white bg-green rounded-full  ', bgColor: 'bg-green', icon: CheckCircle };
    case LIFECYCLE_STAGES.REFUNDED:
      return { label: 'Refunded', color: 'text-red', bgColor: 'bg-red/10', icon: RefreshCw };
    case LIFECYCLE_STAGES.FAILED:
      return { label: 'Failed', color: 'text-red', bgColor: 'bg-red/10', icon: AlertCircle };
    case LIFECYCLE_STAGES.CANCELLED:
      return { label: 'Cancelled', color: 'text-gray-600', bgColor: 'bg-gray-600/10', icon: X };
    default:
      return { label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-600/10', icon: Clock };
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
    [LIFECYCLE_STAGES.TRANSFER_FAILED]: -3,
    [LIFECYCLE_STAGES.CANCELLED]: -4,
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
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-green text-white">
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
      return <ArrowUpRight className="w-4 h-4 text-red" />;
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
      return `${baseClasses} bg-green text-white border border-green`;
    case 'REFUND':
      return `${baseClasses} bg-red/10 text-red border border-red/50`;
    case 'PAYOUT':
      return `${baseClasses} bg-blue-600/10 text-blue-600 border border-blue-600/30`;
    case 'TRANSFER':
      return `${baseClasses} bg-purple-600/10 text-purple-600 border border-purple-600/30`;
    default:
      return `${baseClasses} bg-gray-600/10 text-gray-600 border border-gray-600/30`;
  }
};

const getStatusBadge = (status: string, type?: string) => {
  const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
  const upperStatus = status.toUpperCase();

  // Special handling for refunds - yellow background
  if (type?.toUpperCase() === 'REFUND') {
    if (upperStatus === 'COMPLETED' || upperStatus === 'SUCCEEDED') {
      return `${baseClasses} bg-yellow/50 text-black/80 border border-yellow/70`;
    }
    return `${baseClasses} bg-yellow/20 text-yellow/80 border border-yellow/50`;
  }

  switch (upperStatus) {
    case 'COMPLETED':
    case 'SUCCEEDED':
      return `${baseClasses} bg-green text-white border border-green`;
    case 'PAID':
      return `${baseClasses} bg-green text-white border border-green`;
    case 'PENDING':
      return `${baseClasses} bg-yellow/20 text-yellow/80 border border-yellow/50`;
    case 'PROCESSING':
    case 'IN_TRANSIT':
      return `${baseClasses} bg-blue-600/10 text-blue-600 border border-blue-600/30`;
    case 'FAILED':
      return `${baseClasses} bg-red text-white border border-red`;
    case 'CANCELLED':
    case 'CANCELED':
      return `${baseClasses} bg-red/10 text-red border border-red/50`;
    case 'REFUNDED':
      return `${baseClasses} bg-yellow/50 text-black border border-yellow/70`;
    default:
      return `${baseClasses} bg-gray-600/10 text-gray-600 border border-gray-600/30`;
  }
};

export default function Transactions() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    type: 'ALL' as TransactionType,
    status: 'ALL' as TransactionStatus,
    dateRange: 'ALL'
  });

  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: transactionsData, isLoading: transactionsLoading, refetch } = useTransactions(page, 20, {
    type: activeFilters.type,
    status: activeFilters.status,
    dateRange: activeFilters.dateRange
  });

  // Fetch full transaction details when a transaction is selected
  const { data: transactionDetailsData, isLoading: detailsLoading } = useTransactionDetails(selectedTransactionId);
  const selectedTransaction = transactionDetailsData?.transaction as Transaction | undefined;

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeFilters]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedTransactionId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedTransactionId]);

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


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">View all payments, refunds, payouts, and transfers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowDownLeft className="w-4 h-4 text-green" />
              <span className="text-sm text-gray-600">Payments</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalPayments)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-red" />
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
              <span className="text-sm text-gray-600">Platform Revenue</span>
            </div>
            <p className="text-xl font-bold text-green">{formatCurrency(stats.netRevenue)}</p>
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
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Stripe Fee</TableHead>
                  <TableHead>Net (After Stripe)</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Refund Status</TableHead>
                  <TableHead>Payout Status</TableHead>
                  <TableHead>Field Owner Earnings</TableHead>
                  <TableHead>Recurring</TableHead>
                  <TableHead>Booking Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    {/* Booking ID */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          #{transaction.bookingId?.slice(-4) || '-'}
                        </span>
                        {transaction.booking?.date && (
                          <span className="text-xs text-gray-500">
                            {new Date(transaction.booking.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {/* Amount */}
                    <TableCell>
                      <span className="font-medium text-green">
                        +{formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </TableCell>
                    {/* Stripe Fee */}
                    <TableCell>
                      {transaction.stripeFee ? (
                        <span className="text-orange-600 font-medium">
                          -{formatCurrency(transaction.stripeFee)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    {/* Net After Stripe */}
                    <TableCell>
                      {transaction.amountAfterStripeFee ? (
                        <span className="text-gray-900 font-medium">
                          {formatCurrency(transaction.amountAfterStripeFee)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    {/* Payment Status */}
                    <TableCell>
                      <span className={getStatusBadge(transaction.status, 'PAYMENT')}>
                        {transaction.status}
                      </span>
                    </TableCell>
                    {/* Refund Status */}
                    <TableCell>
                      {transaction.hasRefund ? (
                        <div className="flex flex-col">
                          <span className={getStatusBadge(transaction.refundStatus || 'PENDING', 'REFUND')}>
                            {transaction.refundStatus}
                          </span>
                          {transaction.refundAmount && (
                            <span className="text-xs text-red mt-1">
                              -{formatCurrency(transaction.refundAmount)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No refund</span>
                      )}
                    </TableCell>
                    {/* Payout Status - Enhanced with Transfer info */}
                    <TableCell>
                      <div className="flex flex-col">
                        {/* For cancelled/refunded bookings, show N/A */}
                        {transaction.booking?.status === 'CANCELLED' || transaction.hasRefund ? (
                          <span className="text-gray-400 text-sm">N/A</span>
                        ) : transaction.lifecycleStage && !['PAYMENT_RECEIVED', 'FUNDS_PENDING'].includes(transaction.lifecycleStage) ? (
                          <>
                            {(() => {
                              const stageInfo = getLifecycleStageInfo(transaction.lifecycleStage);
                              const StageIcon = stageInfo.icon;
                              return (
                                <div className="flex items-center gap-1.5">
                                  <StageIcon className={`w-3.5 h-3.5 ${stageInfo.color}`} />
                                  <span className={`text-xs font-medium ${stageInfo.color} ${stageInfo.bgColor} px-2 py-0.5 rounded-full`}>
                                    {stageInfo.label}
                                  </span>
                                </div>
                              );
                            })()}
                            {/* Show transfer ID if transferred */}
                            {transaction.stripeTransferId && (
                              <span className="text-xs text-gray-400 mt-1 font-mono">
                                {transaction.stripeTransferId.slice(0, 12)}...
                              </span>
                            )}
                            {/* Show transferred date */}
                            {transaction.transferredAt && (
                              <span className="text-xs text-gray-500 mt-0.5">
                                {new Date(transaction.transferredAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short'
                                })}
                              </span>
                            )}
                          </>
                        ) : transaction.payoutStatus && transaction.payoutStatus !== 'PENDING' ? (
                          <>
                            <span className={getStatusBadge(transaction.payoutStatus, 'PAYOUT')}>
                              {transaction.payoutStatus}
                            </span>
                            {transaction.payoutReleasedAt && (
                              <span className="text-xs text-gray-500 mt-1">
                                {new Date(transaction.payoutReleasedAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">Pending</span>
                        )}
                      </div>
                    </TableCell>
                    {/* Field Owner Earnings */}
                    <TableCell>
                      {transaction.fieldOwnerEarnings ? (
                        <div className="flex flex-col">
                          <span className="text-blue-600 font-medium">
                            {formatCurrency(transaction.fieldOwnerEarnings)}
                          </span>
                          {transaction.commissionRate !== undefined && transaction.commissionRate !== null && (
                            <span className="text-xs text-gray-500">
                              ({100 - transaction.commissionRate}% of net)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    {/* Recurring */}
                    <TableCell>
                      {transaction.booking?.repeatBooking && transaction.booking.repeatBooking !== 'none' ? (
                        <div className="flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-green" />
                          <span className="text-xs font-medium bg-green/10 text-green px-2 py-0.5 rounded-full capitalize">
                            {transaction.booking.repeatBooking}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">One-time</span>
                      )}
                    </TableCell>
                    {/* Booking Date */}
                    <TableCell>
                      <div className="flex flex-col">
                        {transaction.booking?.date ? (
                          <>
                            <span className="text-gray-900 font-medium">
                              {new Date(transaction.booking.date).toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            {transaction.booking.startTime && transaction.booking.endTime && (
                              <span className="text-xs text-gray-500">
                                {transaction.booking.startTime} - {transaction.booking.endTime}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-600">
                            {new Date(transaction.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {/* Actions */}
                    <TableCell>
                      <button
                        onClick={() => setSelectedTransactionId(transaction.id)}
                        className="p-2 text-gray-500 hover:text-green hover:bg-green/10 rounded-lg transition-colors"
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


      {/* Transaction Detail Modal */}
      {selectedTransactionId && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedTransactionId(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <div
              className="pointer-events-auto bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransactionId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {detailsLoading ? (
                <div className="p-6 flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : selectedTransaction ? (
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
                        ? 'text-red'
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

                {/* Complete Payment Breakdown */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">Complete Payment Breakdown</h4>
                    <p className="text-xs text-gray-500 mt-1">Full breakdown of how the payment is distributed</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Dog Owner Paid */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-gray-900 font-medium">Dog Owner Paid</span>
                        <p className="text-xs text-gray-500">Original payment amount</p>
                      </div>
                      <span className="font-bold text-lg text-gray-900">
                        {formatCurrency(selectedTransaction.paymentBreakdown?.grossAmount || selectedTransaction.amount)}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      {/* Stripe Processing Fee */}
                      {selectedTransaction.paymentBreakdown?.stripeProcessingFee !== undefined && (
                        <div className="flex justify-between items-center text-sm mb-2">
                          <div>
                            <span className="text-gray-600">Stripe Processing Fee</span>
                            <p className="text-xs text-gray-400">~1.5% + £0.20</p>
                          </div>
                          <span className="text-red font-medium">
                            -{formatCurrency(selectedTransaction.paymentBreakdown.stripeProcessingFee)}
                          </span>
                        </div>
                      )}

                      {/* Field Owner Earnings */}
                      <div className="flex justify-between items-center text-sm mb-2">
                        <div>
                          <span className="text-gray-600">Field Owner Earnings</span>
                          <p className="text-xs text-gray-400">
                            {100 - (selectedTransaction.paymentBreakdown?.commissionRate || selectedTransaction.commissionRate || 20)}% of amount after Stripe
                          </p>
                        </div>
                        <span className="text-blue-600 font-medium">
                          {formatCurrency(selectedTransaction.paymentBreakdown?.fieldOwnerAmount || selectedTransaction.fieldOwnerEarnings || 0)}
                        </span>
                      </div>

                      {/* Platform Revenue */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <div>
                          <span className="text-gray-900 font-medium">Platform Revenue</span>
                          <p className="text-xs text-gray-500">
                            {selectedTransaction.paymentBreakdown?.commissionRate || selectedTransaction.commissionRate || 20}% of amount after Stripe
                          </p>
                        </div>
                        <span className="font-bold text-lg text-green">
                          {formatCurrency(selectedTransaction.paymentBreakdown?.platformCommission || selectedTransaction.platformFee || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Status & Cancellation/Payout Info */}
                {selectedTransaction.booking && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">Booking Status</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Booking Created */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Booked On</span>
                        <span className="font-medium">
                          {selectedTransaction.booking.createdAt
                            ? formatDate(selectedTransaction.booking.createdAt)
                            : formatDate(selectedTransaction.createdAt)}
                        </span>
                      </div>

                      {/* Booking Status */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Booking Status</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          selectedTransaction.booking.status === 'CANCELLED'
                            ? 'bg-red/10 text-red'
                            : selectedTransaction.booking.status === 'COMPLETED'
                            ? 'bg-green/10 text-green'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {selectedTransaction.booking.status || 'CONFIRMED'}
                        </span>
                      </div>

                      {/* If Cancelled - Show Cancellation Details */}
                      {selectedTransaction.booking.status === 'CANCELLED' && (
                        <>
                          <div className="border-t border-gray-100 pt-3">
                            <div className="bg-red/5 rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2 text-red">
                                <AlertCircle className="w-4 h-4" />
                                <span className="font-medium">Booking Cancelled</span>
                              </div>
                              {selectedTransaction.booking.cancelledAt && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Cancelled On</span>
                                  <span className="font-medium">{formatDate(selectedTransaction.booking.cancelledAt)}</span>
                                </div>
                              )}
                              {selectedTransaction.booking.cancellationReason && (
                                <div className="text-sm">
                                  <span className="text-gray-600">Reason: </span>
                                  <span className="text-gray-900">{selectedTransaction.booking.cancellationReason}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Refund Status */}
                          {selectedTransaction.relatedTransactions?.refund && (
                            <div className="bg-yellow/10 rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2 text-yellow-700">
                                <RefreshCw className="w-4 h-4" />
                                <span className="font-medium">Refund Processed</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Refund Amount</span>
                                <span className="font-medium text-yellow-700">
                                  {formatCurrency(selectedTransaction.relatedTransactions.refund.amount)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Refund Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  selectedTransaction.relatedTransactions.refund.status === 'COMPLETED' || selectedTransaction.relatedTransactions.refund.status === 'SUCCEEDED'
                                    ? 'bg-green/10 text-green'
                                    : 'bg-yellow/20 text-yellow-700'
                                }`}>
                                  {selectedTransaction.relatedTransactions.refund.status}
                                </span>
                              </div>
                              {selectedTransaction.relatedTransactions.refund.refundedAt && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Refunded On</span>
                                  <span>{formatDate(selectedTransaction.relatedTransactions.refund.refundedAt)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {/* If NOT Cancelled - Show Payout Status */}
                      {selectedTransaction.booking.status !== 'CANCELLED' && (
                        <div className="border-t border-gray-100 pt-3 space-y-2">
                          {/* Determine effective payout status from booking.payoutStatus or lifecycleStage */}
                          {(() => {
                            const bookingPayoutStatus = selectedTransaction.booking.payoutStatus;
                            const lifecycleStage = selectedTransaction.lifecycleStage;

                            // Determine the effective status
                            let effectiveStatus = bookingPayoutStatus || 'PENDING';
                            let isCompleted = bookingPayoutStatus === 'RELEASED' || bookingPayoutStatus === 'COMPLETED';
                            let isTransferred = false;
                            let isProcessing = bookingPayoutStatus === 'PROCESSING';

                            // Check lifecycle stage for more detail
                            if (lifecycleStage === 'PAYOUT_COMPLETED') {
                              isCompleted = true;
                              effectiveStatus = 'COMPLETED';
                            } else if (lifecycleStage === 'PAYOUT_INITIATED') {
                              isProcessing = true;
                              effectiveStatus = 'PROCESSING';
                            } else if (lifecycleStage === 'TRANSFERRED') {
                              isTransferred = true;
                              effectiveStatus = 'TRANSFERRED';
                            }

                            return (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Payout Status</span>
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                    isCompleted
                                      ? 'bg-green text-white'
                                      : isTransferred
                                      ? 'bg-purple-600/20 text-purple-600'
                                      : isProcessing
                                      ? 'bg-blue-600/20 text-blue-600'
                                      : 'bg-yellow/20 text-yellow-700'
                                  }`}>
                                    {effectiveStatus}
                                  </span>
                                </div>

                                {isCompleted ? (
                                  <div className="bg-green/10 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2 text-green">
                                      <CheckCircle className="w-4 h-4" />
                                      <span className="font-medium">Payout Released to Field Owner</span>
                                    </div>
                                    {(selectedTransaction.booking.payoutReleasedAt || selectedTransaction.payoutCompletedAt) && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Released On</span>
                                        <span className="font-medium">{formatDate(selectedTransaction.booking.payoutReleasedAt || selectedTransaction.payoutCompletedAt!)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Amount Released</span>
                                      <span className="font-medium text-green">
                                        {formatCurrency(selectedTransaction.paymentBreakdown?.fieldOwnerAmount || selectedTransaction.fieldOwnerEarnings || 0)}
                                      </span>
                                    </div>
                                  </div>
                                ) : isTransferred ? (
                                  <div className="bg-purple-600/10 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2 text-purple-600">
                                      <ArrowRight className="w-4 h-4" />
                                      <span className="font-medium">Transferred to Field Owner Account</span>
                                    </div>
                                    {selectedTransaction.transferredAt && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Transferred On</span>
                                        <span className="font-medium">{formatDate(selectedTransaction.transferredAt)}</span>
                                      </div>
                                    )}
                                    {selectedTransaction.stripeTransferId && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Transfer ID</span>
                                        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{selectedTransaction.stripeTransferId}</code>
                                      </div>
                                    )}
                                    <p className="text-sm text-gray-600">
                                      Funds have been transferred. Payout to bank account is pending.
                                    </p>
                                  </div>
                                ) : isProcessing ? (
                                  <div className="bg-blue-600/10 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2 text-blue-600">
                                      <Building2 className="w-4 h-4" />
                                      <span className="font-medium">Payout Processing</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      Payout is being processed and will arrive in the field owner's bank account shortly.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-yellow/10 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center gap-2 text-yellow-700">
                                      <Clock className="w-4 h-4" />
                                      <span className="font-medium">Payout Pending</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      The field owner has not received the payout yet. Payouts are typically released after the booking date.
                                    </p>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

                {/* User and Field Owner Details Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dog Owner (Customer) */}
                  {selectedTransaction.user && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-medium text-gray-900">Dog Owner (Customer)</h4>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-semibold text-green">
                              {selectedTransaction.user.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {selectedTransaction.user.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {selectedTransaction.user.email}
                            </p>
                            {selectedTransaction.user.id && (
                              <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                                ID: {selectedTransaction.user.id.substring(0, 12)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Field Owner */}
                  {selectedTransaction.booking?.field?.owner && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-medium text-gray-900">Field Owner</h4>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-semibold text-blue-600">
                              {selectedTransaction.booking.field.owner.name?.charAt(0).toUpperCase() || 'O'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {selectedTransaction.booking.field.owner.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {selectedTransaction.booking.field.owner.email}
                            </p>
                            {selectedTransaction.booking.field.owner.id && (
                              <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                                ID: {selectedTransaction.booking.field.owner.id.substring(0, 12)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Field & Booking Details */}
                {selectedTransaction.booking?.field && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-medium text-gray-900">Field & Booking Details</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Field Name</span>
                        <span className="font-medium text-right">{selectedTransaction.booking.field.name}</span>
                      </div>

                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking Date</span>
                          <span className="font-medium">
                            {new Date(selectedTransaction.booking.date).toLocaleDateString('en-GB', {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {(selectedTransaction.booking.startTime || selectedTransaction.booking.timeSlot) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Slot</span>
                          <span className="font-medium">
                            {selectedTransaction.booking.startTime && selectedTransaction.booking.endTime
                              ? `${selectedTransaction.booking.startTime} - ${selectedTransaction.booking.endTime}`
                              : selectedTransaction.booking.timeSlot}
                          </span>
                        </div>
                      )}

                      {selectedTransaction.booking.numberOfDogs && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Number of Dogs</span>
                          <span className="font-medium">{selectedTransaction.booking.numberOfDogs}</span>
                        </div>
                      )}

                      {selectedTransaction.booking.totalPrice && (
                        <div className="flex justify-between border-t border-gray-100 pt-3">
                          <span className="text-gray-600 font-medium">Booking Total</span>
                          <span className="font-bold text-lg text-gray-900">{formatCurrency(selectedTransaction.booking.totalPrice)}</span>
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
                  <div className="border border-red/50 bg-red/5 rounded-xl overflow-hidden">
                    <div className="bg-red/10 px-4 py-3 border-b border-red/50">
                      <h4 className="font-medium text-red">Failure Details</h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-red">Error Code</span>
                        <code className="bg-red/10 px-2 py-1 rounded text-xs text-red">
                          {selectedTransaction.failureCode}
                        </code>
                      </div>
                      {selectedTransaction.failureMessage && (
                        <p className="text-red text-sm">{selectedTransaction.failureMessage}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Transaction not found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
