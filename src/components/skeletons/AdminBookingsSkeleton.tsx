import React from 'react';

// Skeleton for table rows
export const BookingsTableRowSkeleton = () => {
  return (
    <tr className="border-b border-gray-200">
      {/* Booking ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
      </td>
      {/* Field & Owner */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </td>
      {/* Time Slot */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </td>
      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
      </td>
      {/* Duration */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
      </td>
      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      </td>
      {/* Dogs */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
      </td>
      {/* Price */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
      </td>
      {/* Recurring */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 w-10 bg-gray-200 rounded animate-pulse"></div>
      </td>
      {/* Action */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"></div>
      </td>
    </tr>
  );
};

// Complete table skeleton
export const BookingsTableSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Field & Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Slot
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dogs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recurring
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(10)].map((_, index) => (
              <BookingsTableRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination skeleton */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsTableSkeleton;
