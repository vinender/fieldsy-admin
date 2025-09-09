import React from 'react';
import { useRouter } from 'next/router';

export interface BookingData {
  id: string;
  fieldName: string;
  ownerName: string;
  image?: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  duration: string;
  date: string;
  dogs: number;
  price: number;
  recurring: string;
  customerName?: string;
}

interface BookingRowProps {
  booking: BookingData;
}

const BookingRow: React.FC<BookingRowProps> = ({ booking }) => {
  const router = useRouter();
  
  const statusColors = {
    COMPLETED: 'bg-[#3a6b22]/10 text-[#3a6b22] border-[#3a6b22]/12',
    CONFIRMED: 'bg-[#8fb366]/10 text-[#8fb366] border-[#8fb366]/12',
    PENDING: 'bg-[#f6bd01]/10 text-[#ffbd00] border-[#ffcc26]/16',
    CANCELLED: 'bg-red-50 text-red-500 border-red-200'
  };

  const statusLabels = {
    COMPLETED: 'Completed',
    CONFIRMED: 'Confirmed',
    PENDING: 'Pending',
    CANCELLED: 'Cancelled'
  };

  const handleViewDetail = () => {
    router.push(`/bookings/${booking.id}`);
  };

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <input 
          type="checkbox" 
          className="w-6 h-6 rounded border-2 border-gray-300" 
        />
        <span className="text-[#20130b] text-sm font-normal uppercase w-[59px]">
          {booking.id.slice(0, 6)}
        </span>
        
        <div className="flex items-center gap-3 w-[175px]">
          {booking.image && (
            <img 
              src={booking.image} 
              alt="" 
              className="w-10 h-10 rounded-lg object-cover" 
            />
          )}
          <div className="overflow-hidden">
            <p className="text-[#20130b] text-sm font-semibold truncate">
              {booking.fieldName}
            </p>
            <p className="text-[#575757] text-xs truncate">
              {booking.ownerName}
            </p>
          </div>
        </div>
        
        <span className="text-[#20130b] text-sm w-[92px]">{booking.timeSlot}</span>
        
        <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}>
          {statusLabels[booking.status]}
        </span>
        
        <span className="text-[#20130b] text-sm w-[50px]">{booking.duration}</span>
        <span className="text-[#20130b] text-sm w-[85px]">{booking.date}</span>
        <span className="text-[#20130b] text-sm w-8">{booking.dogs}</span>
        <span className="text-[#20130b] text-sm w-[33px]">${booking.price}</span>
        <span className="text-[#20130b] text-sm w-14">{booking.recurring}</span>
        
        <button 
          onClick={handleViewDetail}
          className="bg-[#3a6b22] hover:bg-[#2d5419] transition-colors text-white text-xs font-semibold px-2.5 py-1.5 rounded-full border border-[#3a6b22]/12"
        >
          View Detail
        </button>
      </div>
      <div className="h-px bg-gray-200" />
    </>
  );
};

export default BookingRow;