import { useState } from 'react';
import  AdminLayout  from '@/components/Layout/AdminLayout';
import {
  useFieldOptionsAdmin,
  useCreateFieldOption,
  useUpdateFieldOption,
  useDeleteFieldOption,
  FieldOption,
} from '@/hooks/useFieldOptions';
import { toast } from 'react-hot-toast';

export default function FieldOptionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<FieldOption | null>(null);

  const { data, isLoading, refetch } = useFieldOptionsAdmin(selectedCategory);
  const createMutation = useCreateFieldOption();
  const updateMutation = useUpdateFieldOption();
  const deleteMutation = useDeleteFieldOption();

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'fieldSize', label: 'Field Size' },
    { value: 'terrainType', label: 'Terrain Type' },
    { value: 'fenceType', label: 'Fence Type' },
    { value: 'fenceSize', label: 'Fence Size' },
    { value: 'surfaceType', label: 'Surface Type' },
    { value: 'openingDays', label: 'Opening Days' },
  ];

  const handleCreate = async (formData: any) => {
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  const handleUpdate = async (id: string, formData: any) => {
    try {
      await updateMutation.mutateAsync({ id, data: formData });
      setEditingOption(null);
      refetch();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this option?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleToggleActive = async (option: FieldOption) => {
    await handleUpdate(option.id, { isActive: !option.isActive });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Field Options Management</h1>
            <p className="text-gray-600 mt-1">Manage dropdown options for field creation forms</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add New Option
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Options Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading options...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value (Slug)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label (Display)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data?.options?.map((option: FieldOption) => (
                  <tr key={option.id} className={!option.isActive ? 'bg-gray-50 opacity-60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {option.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <code className="bg-gray-100 px-2 py-1 rounded">{option.value}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{option.label}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{option.order}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          option.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {option.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleActive(option)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {option.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setEditingOption(option)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(option.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data?.data?.options?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No options found. Create one to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Statistics</h3>
          <p className="text-sm text-blue-700">
            Total Options: {data?.data?.pagination?.total || 0} | Page {data?.data?.pagination?.page || 1} of{' '}
            {data?.data?.pagination?.totalPages || 1}
          </p>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <OptionModal
          title="Create New Field Option"
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
          categories={categories.filter((c) => c.value)}
        />
      )}

      {/* Edit Modal */}
      {editingOption && (
        <OptionModal
          title="Edit Field Option"
          option={editingOption}
          onClose={() => setEditingOption(null)}
          onSubmit={(data) => handleUpdate(editingOption.id, data)}
          isLoading={updateMutation.isPending}
          categories={categories.filter((c) => c.value)}
        />
      )}
    </AdminLayout>
  );
}

// Modal Component
function OptionModal({
  title,
  option,
  onClose,
  onSubmit,
  isLoading,
  categories,
}: {
  title: string;
  option?: FieldOption | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  categories: { value: string; label: string }[];
}) {
  const [formData, setFormData] = useState({
    category: option?.category || '',
    value: option?.value || '',
    label: option?.label || '',
    order: option?.order || 0,
    isActive: option?.isActive !== undefined ? option.isActive : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!!option}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value (Slug) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., small, soft-grass"
                required
                disabled={!!option}
              />
              <p className="mt-1 text-xs text-gray-500">Lowercase with hyphens, cannot be changed after creation</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label (Display Text) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Small (1 acre or less)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : option ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
