import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = (status: string) => {
    const upperStatus = status.toUpperCase();
    
    switch (upperStatus) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'bg-green/10 text-green border border-green-300';
      case 'CANCELLED':
        return 'bg-red/10 text-red border border-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        getStatusStyles(status),
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
};

export default StatusBadge;