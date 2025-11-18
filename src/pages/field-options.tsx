import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import FieldOptionsSettings from '@/components/settings/FieldOptionsSettings';
import { useEffect } from 'react';

export default function FieldOptions() {
  const router = useRouter();
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  if (adminLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <FieldOptionsSettings />
    </AdminLayout>
  );
}
