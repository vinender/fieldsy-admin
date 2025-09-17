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
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getDuration } from '../OwnerDetails';

interface BookingsTableProps {
  bookings: Booking[];
}

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings }) => {
  const router = useRouter();

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
            <TableCell className="text-table-text">
              {booking.startTime} - {booking.endTime}
            </TableCell>
            <TableCell>
              <StatusBadge status={booking.status} />
            </TableCell>
            <TableCell className="text-table-text">
              {getDuration(booking.startTime, booking.endTime)} 
            </TableCell>
            <TableCell className="text-table-text">
              {formatDate(booking.date)}
            </TableCell>
            <TableCell className="text-table-text">
              {booking.dogs}
            </TableCell>
            <TableCell className="font-medium text-gray-900">
              {formatCurrency(booking.totalPrice)}
            </TableCell>
            <TableCell>
              {booking.isRecurring ? (
                <span className="text-green font-[400] text-[13px]">Yes</span>
              ) : (
                <span className="text-table-text font-[400] text-[13px]">No</span>
              )}
            </TableCell>
            <TableCell>
              <button
                onClick={() => router.push(`/bookings/${booking.id}`)}
                className="inline-flex items-center px-[20px] py-[10px]  text-xs font-medium rounded-[40px] text-white bg-green hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green transition-colors"
              >
                 View Detail
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BookingsTable;