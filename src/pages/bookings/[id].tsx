import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import BookingDetail from '@/components/booking-details';
import { useBookingDetails } from '@/hooks/useBookings';
import { useVerifyAdmin } from '@/hooks/useAuth';

export default function BookingDetailsPage() {
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

  return (
    <AdminLayout>
      <BookingDetail booking={booking} />
    </AdminLayout>
  );
}