import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface TransactionFilters {
  search?: string;
  type?: string;
  status?: string;
  dateRange?: string;
}

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
  stripePayoutId?: string;
  stripeTransferId?: string;
  stripeAccountId?: string;
  connectedAccountId?: string;
  arrivalDate?: string;
  failureCode?: string;
  failureMessage?: string;
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

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  pages: number;
  stats: {
    totalPayments: number;
    totalRefunds: number;
    totalPayouts: number;
    totalTransfers: number;
    netRevenue: number;
  };
}

export function useTransactions(
  page: number = 1,
  limit: number = 20,
  filters: TransactionFilters = {}
) {
  return useQuery<TransactionsResponse>({
    queryKey: ['admin-transactions', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.type && filters.type !== 'ALL') {
        params.append('type', filters.type);
      }
      if (filters.status && filters.status !== 'ALL') {
        params.append('status', filters.status);
      }
      if (filters.dateRange && filters.dateRange !== 'ALL') {
        params.append('dateRange', filters.dateRange);
      }

      const response = await api.get(`/admin/transactions?${params.toString()}`);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

interface TransactionDetailsResponse {
  success: boolean;
  transaction: Transaction;
}

export function useTransactionDetails(id: string | null) {
  return useQuery<TransactionDetailsResponse>({
    queryKey: ['admin-transaction', id],
    queryFn: async () => {
      if (!id) throw new Error('Transaction ID is required');
      const response = await api.get(`/admin/transactions/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}
