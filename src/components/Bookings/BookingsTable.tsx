import React from 'react';
import { useRouter } from 'next/router';
import { Eye } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Booking } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableEmptyState,
} from '@/components/ui/table';

interface BookingsTableProps {
  bookings: Booking[];
}

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings }) => {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-lighter text-green',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-600',
      EXPIRED: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.PENDING}`}>
        {status}
      </span>
    );
  };

  if (bookings.length === 0) {
    return (
      <TableContainer>
        <TableEmptyState message="No bookings found" />
      </TableContainer>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Booking ID</TableHead>
          <TableHead>Field & Owner</TableHead>
          <TableHead>Time Slot</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Dogs</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Recurring</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell className="font-medium text-gray-900">
              #{booking.id.slice(-6)}
            </TableCell>
            <TableCell>
              <div>
                <div className="text-sm font-medium text-gray-900">{booking.field.name}</div>
                <div className="text-sm text-gray-500">{booking.field.owner.name || booking.field.owner.email}</div>
              </div>
            </TableCell>
            <TableCell className="text-gray-500">
              {booking.startTime} - {booking.endTime}
            </TableCell>
            <TableCell>
              {getStatusBadge(booking.status)}
            </TableCell>
            <TableCell className="text-gray-500">
              {booking.duration} hours
            </TableCell>
            <TableCell className="text-gray-500">
              {formatDate(booking.date)}
            </TableCell>
            <TableCell className="text-gray-500">
              {booking.dogs}
            </TableCell>
            <TableCell className="font-medium text-gray-900">
              {formatCurrency(booking.totalPrice)}
            </TableCell>
            <TableCell>
              {booking.isRecurring ? (
                <span className="text-green font-medium text-sm">Yes</span>
              ) : (
                <span className="text-gray-400 text-sm">No</span>
              )}
            </TableCell>
            <TableCell>
              <button
                onClick={() => router.push(`/bookings/${booking.id}`)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green transition-colors"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BookingsTable;