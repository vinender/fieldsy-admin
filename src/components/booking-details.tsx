import React from 'react';
import { useRouter } from 'next/router';
import { formatDate, formatCurrency } from '@/lib/utils';

interface BookingDetailsProps {
  booking: any;
}

export default function BookingDetail({ booking }: BookingDetailsProps) {
  const router = useRouter();
  
  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No booking details available</p>
      </div>
    );
  }

  // Format status display
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'text-[#3a6b22]';
      case 'CONFIRMED':
      case 'ACTIVE':
        return 'text-blue-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Format time slot
  const formatTimeSlot = () => {
    if (booking.startTime && booking.endTime) {
      return `${booking.startTime} - ${booking.endTime}`;
    }
    return booking.startTime || 'N/A';
  };

  // Format operating hours
  const formatOperatingHours = () => {
    const field = booking.field;
    if (field?.openingTime && field?.closingTime && field?.operatingDays?.length) {
      return `${field.operatingDays.join(', ')} (${field.openingTime} - ${field.closingTime})`;
    }
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-[#fffcf3] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#192215]">
            <span className="text-[#8d8d8d]">Bookings Overview /</span>
            <span> Booking Detail</span>
          </h1>
        </div>

        {/* Content Container */}
        <div className="space-y-6">
          {/* Booking Summary Section */}
          <div className="space-y-2.5">
            <h2 className="text-xl font-semibold text-[#192215]">Booking Summary</h2>
            <div className="bg-white rounded-2xl p-6 shadow-[0px_10px_13px_0px_rgba(0,0,0,0.04)] border border-black/10">
              {/* First Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-5">
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Booking ID</p>
                  <p className="text-base font-semibold text-[#192215]">
                    {booking.id ? `#${booking.id.slice(0, 8).toUpperCase()}` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Booking Date</p>
                  <p className="text-base font-semibold text-[#192215]">
                    {booking.date ? formatDate(booking.date) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Time Slot</p>
                  <p className="text-base font-semibold text-[#192215]">
                    {formatTimeSlot()}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Status</p>
                  <p className={`text-base font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Duration</p>
                  <p className="text-base font-semibold text-[#192215]">
                    {booking.duration || booking.field?.bookingDuration || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Amount Paid</p>
                  <p className="text-base font-semibold text-[#192215]">
                    {booking.totalPrice ? formatCurrency(booking.totalPrice) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Payment Method</p>
                  <p className="text-base font-semibold text-[#192215]">
                    {booking.paymentMethod || 'Card'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Dogs</p>
                  <p className="text-base font-semibold text-[#192215]">
                    {booking.numberOfDogs || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Information Section */}
          <div className="space-y-2.5">
            <h2 className="text-xl font-semibold text-[#192215]">User Information</h2>
            <div className="bg-white rounded-2xl p-6 shadow-[0px_10px_13px_0px_rgba(0,0,0,0.04)] border border-black/10">
              <div className="flex items-center gap-6">
                {/* User Avatar */}
                <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                  {booking.user?.image ? (
                    <img 
                      src={booking.user.image} 
                      alt={booking.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        {booking.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Details Grid */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-sm text-[#8d8d8d]">Name</p>
                    <p className="text-base font-semibold text-[#192215]">
                      {booking.user?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm text-[#8d8d8d]">Email</p>
                    <p className="text-base font-semibold text-[#192215] truncate">
                      {booking.user?.email || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm text-[#8d8d8d]">Phone</p>
                    <p className="text-base font-semibold text-[#192215]">
                      {booking.user?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm text-[#8d8d8d]">Total Bookings</p>
                    <p className="text-base font-semibold text-[#192215]">
                      {booking.user?._count?.bookings || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm text-[#8d8d8d]">Account Status</p>
                    <p className="text-base font-semibold text-[#3a6b22]">
                      {booking.user?.isActive !== false ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Field Information Section */}
          <div className="space-y-2.5">
            <h2 className="text-xl font-semibold text-[#192215]">Field Information</h2>
            <div className="bg-white rounded-2xl p-6 shadow-[0px_10px_13px_0px_rgba(0,0,0,0.04)] border border-black/10">
              <div className="flex items-center justify-between gap-6">
                {/* Field Image */}
                <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                  {booking.field?.images?.[0] ? (
                    <img 
                      src={booking.field.images[0]} 
                      alt={booking.field.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-300 to-green-400"></div>
                  )}
                </div>

                {/* Field Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <p className="text-sm text-[#8d8d8d]">Name</p>
                    <p className="text-base font-semibold text-[#192215]">
                      {booking.field?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm text-[#8d8d8d]">Location</p>
                    <p className="text-base font-semibold text-[#192215]">
                      {booking.field?.city && booking.field?.state 
                        ? `${booking.field.city}, ${booking.field.state}` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm text-[#8d8d8d]">Opening Hours</p>
                    <p className="text-base font-semibold text-[#192215]">
                      {formatOperatingHours()}
                    </p>
                  </div>
                </div>

                {/* View Detail Button */}
                <button 
                  onClick={() => router.push(`/fields/${booking.field?.id}`)}
                  className="bg-[#3a6b22] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#2d5419] transition-colors flex-shrink-0 border border-[rgba(58,107,34,0.12)]"
                >
                  View Field Details
                </button>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="space-y-2.5">
            <h2 className="text-xl font-semibold text-[#192215]">Payment Details</h2>
            <div className="bg-white rounded-2xl p-6 shadow-[0px_10px_13px_0px_rgba(0,0,0,0.04)] border border-black/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Subtotal</p>
                  <p className="text-base font-semibold text-[#192215]">
                    {booking.subtotal ? formatCurrency(booking.subtotal) : formatCurrency(booking.totalPrice || 0)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Service Fee</p>
                  <p className="text-base font-semibold text-[#192215]">
                    {booking.serviceFee ? formatCurrency(booking.serviceFee) : '$0'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Tax</p>
                  <p className="text-base font-semibold text-[#192215]">
                    {booking.tax ? formatCurrency(booking.tax) : '$0'}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-[#8d8d8d]">Total Paid</p>
                  <p className="text-base font-semibold text-[#3a6b22]">
                    {booking.totalPrice ? formatCurrency(booking.totalPrice) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}