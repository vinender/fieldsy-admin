import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useBookingDetails } from '@/hooks/useBookings';
import { useVerifyAdmin } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  CreditCard,
  Dog,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';

export default function BookingDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: booking, isLoading: bookingLoading } = useBookingDetails(id as string);

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  if (adminLoading || bookingLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!booking) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Booking not found</p>
        </div>
      </AdminLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/bookings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600 mt-1">#{booking.id}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border ${getStatusColor(booking.status)} flex items-center space-x-2`}>
            {getStatusIcon(booking.status)}
            <span className="font-medium">{booking.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(booking.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{booking.startTime} - {booking.endTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Dog className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Number of Dogs</p>
                      <p className="font-medium">{booking.dogs}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{booking.duration} hours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="font-medium text-lg">{formatCurrency(booking.totalPrice)}</p>
                    </div>
                  </div>
                  {booking.isRecurring && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Recurring</p>
                        <p className="font-medium text-green-600">Yes</p>
                        {booking.recurringDays && (
                          <p className="text-xs text-gray-500 mt-1">
                            {booking.recurringDays.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {booking.notes && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Notes</p>
                      <p className="text-gray-700">{booking.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Field Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Field Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Field Name</p>
                  <p className="font-medium">{booking.field.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{booking.field.address}</p>
                  <p className="text-sm text-gray-600">
                    {booking.field.city}, {booking.field.state} {booking.field.zipCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Field Type</p>
                  <p className="font-medium">{booking.field.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Field Owner</p>
                  <p className="font-medium">{booking.field.owner.name || booking.field.owner.email}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {booking.payment && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Payment Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.payment.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800'
                        : booking.payment.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.payment.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="font-medium">{formatCurrency(booking.payment.amount)}</span>
                  </div>
                  {booking.payment.stripePaymentIntentId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Payment Intent</span>
                      <span className="font-mono text-xs">{booking.payment.stripePaymentIntentId.slice(-8)}</span>
                    </div>
                  )}
                  {booking.payment.refundAmount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Refund Amount</span>
                      <span className="font-medium text-red-600">{formatCurrency(booking.payment.refundAmount)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{booking.user.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{booking.user.email}</p>
                  </div>
                </div>
                {booking.user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{booking.user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {booking.status === 'PENDING' && (
                  <>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      Confirm Booking
                    </button>
                    <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                      Cancel Booking
                    </button>
                  </>
                )}
                {booking.status === 'CONFIRMED' && (
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Mark as Completed
                  </button>
                )}
                {booking.payment && booking.payment.status === 'COMPLETED' && !booking.payment.refundId && (
                  <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
                    Process Refund
                  </button>
                )}
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Send Notification
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-sm font-medium">Booking Created</p>
                    <p className="text-xs text-gray-500">{formatDate(booking.createdAt)} at {formatTime(booking.createdAt)}</p>
                  </div>
                </div>
                {booking.updatedAt !== booking.createdAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-xs text-gray-500">{formatDate(booking.updatedAt)} at {formatTime(booking.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}