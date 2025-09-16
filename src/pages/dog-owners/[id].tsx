import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import OwnerDetails from '@/components/OwnerDetails';
import { useUserDetails } from '@/hooks/useUsers';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';

export default function DogOwnerDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: userDetails, isLoading: userLoading, error: userError } = useUserDetails(id as string);

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  if (adminLoading || userLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (userError || !userDetails) {
    return (
      <AdminLayout>
        <div className="p-6">
          <button
            onClick={() => router.push('/dog-owners')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dog Owners
          </button>
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load user details</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="relative">
        <button
          onClick={() => router.push('/dog-owners')}
          className="absolute top-0 left-4 sm:left-6 flex items-center text-gray-600 hover:text-gray-900 z-10 text-sm sm:text-base"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back to Dog Owners</span>
          <span className="sm:hidden">Back</span>
        </button>
        <OwnerDetails user={userDetails.user} />
      </div>
    </AdminLayout>
  );
}