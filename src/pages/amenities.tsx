import { useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import AdminLayout from '@/components/Layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, GripVertical, Upload, X } from 'lucide-react';
import { useAmenities, useCreateAmenity, useUpdateAmenity, useDeleteAmenity, useReorderAmenities } from '@/hooks/useAmenities';
import { useUploadSingle } from '@/hooks/useUpload';
import { toast } from 'sonner';
import { AmenityIcon } from '@/components/ui/AmenityIcon';

interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  isActive: boolean;
  order: number;
}

export default function AmenitiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: '', isActive: true });

  const { amenities, isLoading, refetch } = useAmenities();
  const createMutation = useCreateAmenity();
  const updateMutation = useUpdateAmenity();
  const deleteMutation = useDeleteAmenity();
  const reorderMutation = useReorderAmenities();
  const uploadMutation = useUploadSingle();

  const handleOpenModal = (amenity?: Amenity) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setFormData({
        name: amenity.name,
        icon: amenity.icon || '',
        isActive: amenity.isActive
      });
    } else {
      setEditingAmenity(null);
      setFormData({ name: '', icon: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAmenity(null);
    setFormData({ name: '', icon: '', isActive: true });
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only SVG allowed
    if (file.type !== 'image/svg+xml') {
      toast.error('Please upload an SVG file only');
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file size (max 500KB for SVG)
    if (file.size > 500 * 1024) {
      toast.error('SVG file size should be less than 500KB');
      e.target.value = ''; // Reset input
      return;
    }

    try {
      const data = await uploadMutation.mutateAsync(file);
      setFormData(prev => ({ ...prev, icon: data.url }));
      toast.success('SVG icon uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload icon');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Amenity name is required');
      return;
    }

    try {
      if (editingAmenity) {
        await updateMutation.mutateAsync({
          id: editingAmenity.id,
          data: formData
        });
        toast.success('Amenity updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Amenity created successfully');
      }
      handleCloseModal();
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this amenity?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Amenity deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete amenity');
    }
  };

  const handleToggleActive = async (amenity: Amenity) => {
    try {
      await updateMutation.mutateAsync({
        id: amenity.id,
        data: { isActive: !amenity.isActive }
      });
      toast.success(`Amenity ${!amenity.isActive ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update amenity');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Amenities Management</h1>
            <p className="text-gray-600 mt-1">Manage field amenities and their icons</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-green text-white hover:bg-green/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Amenity
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto lg:overflow-x-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Icon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th> */}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {amenities?.map((amenity: Amenity) => (
                    <tr key={amenity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {amenity.icon ? (
                          <div className="w-8 h-8">
                            <AmenityIcon
                              src={amenity.icon}
                              alt={amenity.name}
                              fillColor="#22C55E"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No icon</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{amenity.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(amenity)}
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${amenity.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {amenity.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(amenity)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(amenity.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingAmenity ? 'Edit Amenity' : 'Add New Amenity'}
                </h2>
                <button onClick={handleCloseModal}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Amenity Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Water bowls"
                    required
                  />
                </div>

                <div>
                  <Label>Icon Image</Label>
                  <p className="text-xs text-amber-600 mt-1 mb-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Only SVG icons are accepted. Max size: 500KB
                  </p>
                  <div className="mt-2">
                    {formData.icon ? (
                      <div className="space-y-2">
                        <div className="relative inline-block">
                          <div className="relative w-20 h-20 border rounded p-2">
                            {uploadMutation.isPending ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <Spinner size="sm" />
                              </div>
                            ) : (
                              <AmenityIcon
                                src={formData.icon}
                                alt="Icon preview"
                              />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            title="Remove icon"
                            disabled={uploadMutation.isPending}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                            {uploadMutation.isPending ? (
                              <Spinner size="sm" className="mr-2" />
                            ) : (
                              <Upload className="w-4 h-4 mr-2 text-gray-600" />
                            )}
                            <span className="text-sm text-gray-700">
                              {uploadMutation.isPending ? 'Uploading...' : 'Change Icon'}
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept=".svg,image/svg+xml"
                              onChange={handleIconUpload}
                              disabled={uploadMutation.isPending}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-green">
                        <div className="flex flex-col items-center">
                          {uploadMutation.isPending ? (
                            <Spinner size="md" />
                          ) : (
                            <Upload className="w-6 h-6 text-gray-400" />
                          )}
                          <span className="mt-1 text-xs text-gray-500">
                            {uploadMutation.isPending ? 'Uploading...' : 'Click to upload SVG'}
                          </span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".svg,image/svg+xml"
                          onChange={handleIconUpload}
                          disabled={uploadMutation.isPending}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-green focus:ring-green border-gray-300 rounded"
                  />
                  <Label htmlFor="isActive" className="ml-2 mb-0">
                    Active
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green text-white hover:bg-green/90"
                    disabled={createMutation.isPending || updateMutation.isPending || uploadMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        {editingAmenity ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingAmenity ? 'Update' : 'Create'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
