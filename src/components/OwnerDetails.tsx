import React from 'react';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Booking {
  id: string;
  field: {
    name: string;
    location: any; // JSON object with streetAddress, city, etc.
  };
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  paymentStatus?: string;
  numberOfDogs: number;
  createdAt: string;
}

interface OwnerDetailsProps {
  user: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    image?: string;
    googleImage?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
      bookings: number;
    };
    bookings?: Booking[];
  };
}


export const getDuration = (startTime: string, endTime: string) => {
  console.log('startTime', startTime);
  console.log('endTime', endTime);
  // Handle missing or invalid times
  if (!startTime || !endTime) {
    return 'N/A';
  }
  
  try {
    // Function to convert 12-hour format to 24-hour minutes
    const parseTimeToMinutes = (timeStr: string) => {
      // Check if it's 12-hour format (contains AM/PM)
      const isAmPm = timeStr.toUpperCase().includes('AM') || timeStr.toUpperCase().includes('PM');
      
      if (isAmPm) {
        // Parse 12-hour format like "12:00PM" or "1:00PM"
        const timeUpper = timeStr.toUpperCase();
        const isPM = timeUpper.includes('PM');
        const timePart = timeUpper.replace('AM', '').replace('PM', '').trim();
        const [hoursStr, minutesStr] = timePart.split(':');
        
        let hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr) || 0;
        
        if (isNaN(hours) || isNaN(minutes)) {
          return null;
        }
        
        // Convert to 24-hour format
        if (isPM && hours !== 12) {
          hours += 12;
        } else if (!isPM && hours === 12) {
          hours = 0;
        }
        
        return hours * 60 + minutes;
      } else {
        // Parse 24-hour format like "14:00"
        const [hoursStr, minutesStr] = timeStr.split(':');
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr) || 0;
        
        if (isNaN(hours) || isNaN(minutes)) {
          return null;
        }
        
        return hours * 60 + minutes;
      }
    };
    
    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);
    
    if (startMins === null || endMins === null) {
      return 'N/A';
    }
    
    let diffMins = endMins - startMins;
    
    // Handle case where end time is next day
    if (diffMins < 0) {
      diffMins += 24 * 60; // Add 24 hours
    }
    
    if (diffMins === 0) {
      return '0min';
    } else if (diffMins < 60) {
      return `${diffMins}min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}hr ${mins}min` : `${hours}hr`;
    }
  } catch (error) {
    console.error('Error calculating duration:', error, { startTime, endTime });
    return 'N/A';
  }
};


export default function OwnerDetails({ user }: OwnerDetailsProps) {
  // Debug: Log the user data to see what we're receiving
  console.log('User data received:', user);
  console.log('Bookings:', user?.bookings);

  const calculateTotalSpent = () => {
    return user.bookings?.reduce((total, booking) => {
      if (booking.status === 'completed' || booking.status === 'confirmed') {
        return total + booking.totalPrice;
      }
      return total;
    }, 0) || 0;
  };

  const getLastActive = () => {
    if (user.updatedAt) {
      const date = new Date(user.updatedAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    }
    return 'Unknown';
  };

  const formatTime = (date: string, startTime: string, endTime: string) => {
    const bookingDate = new Date(date);
    const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Convert time strings like "14:00" to "2:00 PM"
    const convertTo12Hour = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return `${dayName}, ${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
  };

  

  return (
    <div className="min-h-screen bg-[#fffcf3] p-4 sm:p-6 md:p-8">
      <div className="max-w-full mx-auto">
        {/* Page Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-table-text mb-4 sm:mb-6 md:mb-8">Owner Details</h1>

        {/* Basic Information Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-table-text mb-3 sm:mb-4">Basic Information</h2>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0px_10px_13px_0px_rgba(0,0,0,0.04)] border border-black/10">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Profile Avatar */}
              <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                {(user.image || user.googleImage) ? (
                  <img 
                    src={user.image || user.googleImage} 
                    alt={user.name || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Information Grid */}
              <div className="flex-1 w-full">
                {/* First Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-x-8 sm:gap-y-4 mb-4">
                  <div className="mb-3 sm:mb-0">
                    <p className="text-xs sm:text-sm text-[#8d8d8d] mb-1">Name</p>
                    <p className="text-sm sm:text-base font-semibold text-table-text break-words">{user.name || 'Not provided'}</p>
                  </div>
                  <div className="mb-3 sm:mb-0">
                    <p className="text-xs sm:text-sm text-[#8d8d8d] mb-1">Email</p>
                    <p className="text-sm sm:text-base font-semibold text-table-text break-all">{user.email}</p>
                  </div>
                  <div className="mb-3 sm:mb-0">
                    <p className="text-xs sm:text-sm text-[#8d8d8d] mb-1">Phone</p>
                    <p className="text-sm sm:text-base font-semibold text-table-text">{user.phone || 'Not provided'}</p>
                  </div>
                  <div className="mb-3 sm:mb-0">
                    <p className="text-xs sm:text-sm text-[#8d8d8d] mb-1">Total Bookings</p>
                    <p className="text-sm sm:text-base font-semibold text-table-text">{user._count?.bookings || 0}</p>
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-x-8 sm:gap-y-4">
                  <div className="mb-3 sm:mb-0">
                    <p className="text-xs sm:text-sm text-[#8d8d8d] mb-1">Joined Date</p>
                    <p className="text-sm sm:text-base font-semibold text-table-text">{formatDate(user.createdAt)}</p>
                  </div>
                  <div className="mb-3 sm:mb-0">
                    <p className="text-xs sm:text-sm text-[#8d8d8d] mb-1">Last Active</p>
                    <p className="text-sm sm:text-base font-semibold text-table-text">{getLastActive()}</p>
                  </div>
                  <div className="mb-3 sm:mb-0">
                    <p className="text-xs sm:text-sm text-[#8d8d8d] mb-1">Total Spent</p>
                    <p className="text-sm sm:text-base font-semibold text-table-text">£{calculateTotalSpent().toFixed(2)}</p>
                  </div>
                  <div className="mb-3 sm:mb-0">
                    <p className="text-xs sm:text-sm text-[#8d8d8d] mb-1">Account Status</p>
                    <p className={`text-sm sm:text-base font-semibold ${user.emailVerified ? 'text-[#3a6b22]' : 'text-yellow-600'}`}>
                      {user.emailVerified ? 'Active' : 'Unverified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking History Section */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-table-text mb-3 sm:mb-4">Booking History</h2>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-[0px_10px_13px_0px_rgba(0,0,0,0.04)] border border-black/10 overflow-hidden">
            {user?.bookings && user?.bookings.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[768px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium text-[#8d8d8d] whitespace-nowrap">Field Name</th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#8d8d8d] whitespace-nowrap">Duration</th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#8d8d8d] whitespace-nowrap">Time</th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#8d8d8d] whitespace-nowrap">Date</th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#8d8d8d] whitespace-nowrap">Location</th>
                      <th className="text-center py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#8d8d8d] whitespace-nowrap">Dogs</th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#8d8d8d] whitespace-nowrap">Amount</th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#8d8d8d] whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user?.bookings?.map((booking, index) => (
                      <tr key={booking.id} className={index !== user.bookings!.length - 1 ? 'border-b border-gray-100' : ''}>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-medium text-table-text">{booking.field.name}</p>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-normal text-table-text">{getDuration(booking.startTime, booking.endTime)}</p>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-normal text-table-text">{formatTime(booking.date, booking.startTime, booking.endTime)}</p>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-normal text-table-text">{formatDate(booking.date)}</p>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4">
                          <p className="text-xs sm:text-sm font-normal text-table-text max-w-[150px] truncate">
                            {typeof booking.field.location === 'object' && booking.field.location 
                              ? (booking.field.location.streetAddress || booking.field.location.formatted_address || 'N/A')
                              : (booking.field.location || 'N/A')}
                          </p>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 text-center whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-normal text-table-text">{booking.numberOfDogs || 1}</p>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                          <p className="text-xs sm:text-sm font-normal text-table-text">£{booking.totalPrice.toFixed(2)}</p>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                          <StatusBadge status={booking.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center">
                <p className="text-sm sm:text-base text-gray-500">No booking history available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}