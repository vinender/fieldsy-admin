import { useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import {
  useFieldOptionsAdmin,
  useCreateFieldOption,
  useUpdateFieldOption,
  useDeleteFieldOption,
  FieldOption,
} from '@/hooks/useFieldOptions';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';

export default function FieldOptionsSettings() {
  const [selectedCategory, setSelectedCategory] = useState('fieldSize');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<FieldOption | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    value: '',
    label: '',
    isActive: true,
    order: 0,
  });

  const { data, isLoading, refetch } = useFieldOptionsAdmin(selectedCategory);
  const createMutation = useCreateFieldOption();
  const updateMutation = useUpdateFieldOption();
  const deleteMutation = useDeleteFieldOption();

  const categories = [
    { value: 'fieldSize', label: 'Field Size', icon: '📏', valuePlaceholder: 'e.g., small, medium, large, extra-large', labelPlaceholder: 'e.g., Small (up to 1 acre)' },
    { value: 'terrainType', label: 'Terrain Type', icon: '🏞️', valuePlaceholder: 'e.g., flat, hilly, mixed, woodland', labelPlaceholder: 'e.g., Flat Open Field' },
    { value: 'fenceType', label: 'Fence Type', icon: '🚧', valuePlaceholder: 'e.g., wooden, metal, wire, electric', labelPlaceholder: 'e.g., Wooden Post & Rail' },
    { value: 'fenceSize', label: 'Fence Size', icon: '📐', valuePlaceholder: 'e.g., 4ft, 5ft, 6ft, 8ft', labelPlaceholder: 'e.g., 6ft (1.8m) High' },
    { value: 'surfaceType', label: 'Surface Type', icon: '🌱', valuePlaceholder: 'e.g., grass, gravel, sand, mixed', labelPlaceholder: 'e.g., Natural Grass' },
    { value: 'openingDays', label: 'Opening Days', icon: '📅', valuePlaceholder: 'e.g., weekdays, weekends, all-week', labelPlaceholder: 'e.g., Weekdays Only (Mon-Fri)' },
  ];

  const getCategoryLabel = (value: string) => {
    return categories.find(cat => cat.value === value)?.label || value;
  };

  const getValuePlaceholder = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue)?.valuePlaceholder || 'e.g., option-value';
  };

  const getLabelPlaceholder = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue)?.labelPlaceholder || 'e.g., Option Label';
  };

  const handleCreate = () => {
    const options = data?.data?.options || [];
    const maxOrder = options.length > 0 ? Math.max(...options.map((opt: FieldOption) => opt.order)) : 0;

    setFormData({
      category: selectedCategory,
      value: '',
      label: '',
      isActive: true,
      order: maxOrder + 1,
    });
    setEditingOption(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (option: FieldOption) => {
    setFormData({
      category: option.category,
      value: option.value,
      label: option.label,
      isActive: option.isActive,
      order: option.order,
    });
    setEditingOption(option);
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingOption) {
        await updateMutation.mutateAsync({
          id: editingOption.id,
          data: {
            label: formData.label,
            isActive: formData.isActive,
            order: formData.order,
          },
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Submit failed:', error);
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
    try {
      await updateMutation.mutateAsync({
        id: option.id,
        data: { isActive: !option.isActive },
      });
      refetch();
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  const options = data?.data?.options || [];
  const stats = {
    total: data?.data?.pagination?.total || 0,
    active: options.filter((opt: FieldOption) => opt.isActive).length,
    inactive: options.filter((opt: FieldOption) => !opt.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Field Options Management</h2>
          <p className="text-gray-600 mt-1">Manage dropdown options for field creation forms</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-green text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add to {getCategoryLabel(selectedCategory)}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-600 font-medium">Total Options</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Active</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 font-medium">Inactive</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                selectedCategory === cat.value
                  ? 'border-green text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Options Table */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Spinner size="xl" className="mx-auto" />
          <p className="text-gray-600 mt-4 font-medium">Loading {getCategoryLabel(selectedCategory)}...</p>
        </div>
      ) : options.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-6xl mb-4">{categories.find(c => c.value === selectedCategory)?.icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No options in {getCategoryLabel(selectedCategory)}</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first option for this category.</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Option
          </button>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-100 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Value (Slug)
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Display Label
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Display Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {options.map((option: FieldOption) => (
                <tr key={option.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded font-mono">
                      {option.value}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{option.order}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(option)}
                      className="inline-flex items-center gap-2 transition-all hover:scale-105"
                      title={option.isActive ? 'Click to deactivate' : 'Click to activate'}
                    >
                      {option.isActive ? (
                        <>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                            <div className="w-2 h-2 bg-green rounded-full"></div>
                            <span className="text-xs font-semibold text-green-700">Active</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-xs font-semibold text-gray-600">Inactive</span>
                          </div>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(option)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit option"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(option.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green text-white rounded-lg flex items-center justify-center text-xl">
                  {categories.find(c => c.value === formData.category)?.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingOption ? 'Edit Option' : 'Create New Option'}
                  </h3>
                  <p className="text-sm text-gray-600">{getCategoryLabel(formData.category)}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={!!editingOption}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-green disabled:bg-gray-50 disabled:text-gray-500"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                {editingOption && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <span className="font-semibold">⚠️</span> Category cannot be changed
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Value (Slug) *
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  disabled={!!editingOption}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-green font-mono text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder={getValuePlaceholder(formData.category)}
                  required
                />
                {editingOption ? (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <span className="font-semibold">⚠️</span> Value cannot be changed to maintain data integrity
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1.5">Use lowercase letters, numbers, and hyphens only</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-green"
                  placeholder={getLabelPlaceholder(formData.category)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">This text will be shown to users in forms</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-green"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1.5">Lower numbers appear first in dropdowns</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-green border-gray-300 rounded focus:ring-2 focus:ring-green"
                />
                <label htmlFor="isActive" className="flex-1">
                  <span className="block text-sm font-semibold text-gray-900">Active Status</span>
                  <span className="text-xs text-gray-600">When active, this option will appear in field creation forms</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-green text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green/20"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      Saving...
                    </span>
                  ) : editingOption ? (
                    'Update Option'
                  ) : (
                    'Create Option'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
