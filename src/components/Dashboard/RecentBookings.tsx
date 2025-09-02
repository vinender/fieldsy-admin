import React from 'react';
import { Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';
import { Booking } from '@/types';

interface RecentBookingsProps {
  bookings: Booking[];
}

const RecentBookings: React.FC<RecentBookingsProps> = ({ bookings }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {bookings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No recent bookings
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-sm text-gray-500">#{booking.id.slice(-6)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{booking.user.name || booking.user.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{booking.field.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{formatDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{booking.startTime} - {booking.endTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-lg font-semibold text-gray-900">
                    <DollarSign className="w-5 h-5" />
                    <span>{formatCurrency(booking.totalPrice)}</span>
                  </div>
                  {booking.isRecurring && (
                    <span className="text-xs text-blue-600 font-medium">Recurring</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentBookings;