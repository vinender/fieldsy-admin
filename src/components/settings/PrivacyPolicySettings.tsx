import React, { useState } from 'react';
import { Plus, Edit2, Trash2, XCircle } from 'lucide-react';
import { usePrivacyPolicy, useCreatePrivacySection, useUpdatePrivacySection, useDeletePrivacySection, PrivacySection } from '@/hooks/usePrivacyPolicy';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

export default function PrivacyPolicySettings() {
    const { data: sections, isLoading, error } = usePrivacyPolicy();
    const createSection = useCreatePrivacySection();
    const updateSection = useUpdatePrivacySection();
    const deleteSection = useDeletePrivacySection();

    const [editingSection, setEditingSection] = useState<Partial<PrivacySection> | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleAdd = () => {
        setEditingSection({ title: '', content: '', isList: false });
        setShowModal(true);
    };

    const handleEdit = (section: PrivacySection) => {
        setEditingSection({
            ...section,
            content: Array.isArray(section.content) ? section.content.join('\n') : section.content
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        try {
            await deleteSection.mutateAsync(id);
            toast.success('Section deleted successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete section');
        }
    };

    const handleSave = async () => {
        if (!editingSection || !editingSection.title) {
            toast.error('Title is required');
            return;
        }

        let contentToSave: string | string[] = editingSection.content || '';
        if (editingSection.isList && typeof editingSection.content === 'string') {
            contentToSave = editingSection.content.split('\n').filter(line => line.trim() !== '');
        }

        const sectionData: any = { ...editingSection, content: contentToSave };
        const toastId = toast.loading('Saving...');

        try {
            if (editingSection.id) {
                await updateSection.mutateAsync({ id: editingSection.id, data: sectionData });
                toast.success('Section updated', { id: toastId });
            } else {
                const nextOrder = sections ? sections.length : 0;
                await createSection.mutateAsync({ ...sectionData, order: nextOrder });
                toast.success('Section created', { id: toastId });
            }
            setShowModal(false);
            setEditingSection(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to save section', { id: toastId });
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (error) return <div className="text-red-500 p-4">Error loading privacy policy</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Privacy Policy Management</h2>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg hover:bg-green-hover"
                >
                    <Plus className="w-4 h-4" />
                    Add Section
                </button>
            </div>

            <div className="space-y-4">
                {sections && sections.map((section, index) => (
                    <div key={section.id || index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                                    {section.isList && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            List
                                        </span>
                                    )}
                                </div>

                                {section.isList && Array.isArray(section.content) ? (
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                                        {section.content.slice(0, 3).map((item, i) => (
                                            <li key={i}>{typeof item === 'string' && item.length > 80 ? item.substring(0, 80) + '...' : item}</li>
                                        ))}
                                        {section.content.length > 3 && (
                                            <li className="text-gray-400 italic">...and {section.content.length - 3} more items</li>
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-600 whitespace-pre-line">
                                        {typeof section.content === 'string' && section.content.length > 150
                                            ? section.content.substring(0, 150) + '...'
                                            : section.content}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                <button
                                    onClick={() => handleEdit(section)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(section.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {(!sections || sections.length === 0) && (
                    <p className="text-center text-gray-500 py-8 italic">No privacy policy sections defined yet.</p>
                )}
            </div>

            {/* Modal */}
            {showModal && editingSection && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4 flex items-center justify-center">
                    <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-xl bg-white max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingSection.id ? 'Edit Section' : 'Add New Section'}
                            </h3>
                            <button
                                onClick={() => { setShowModal(false); setEditingSection(null); }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                                <input
                                    type="text"
                                    value={editingSection.title || ''}
                                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green"
                                    placeholder="e.g., 1. Who We Are"
                                />
                            </div>

                            <div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingSection.isList || false}
                                        onChange={(e) => setEditingSection({ ...editingSection, isList: e.target.checked })}
                                        className="h-4 w-4 text-green focus:ring-green border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Display as bulleted list</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content
                                    {editingSection.isList && <span className="text-xs text-gray-500 ml-2">(Enter each list item on a new line)</span>}
                                </label>
                                <textarea
                                    value={editingSection.content as string || ''}
                                    onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green min-h-[200px]"
                                    placeholder={editingSection.isList ? "Item 1\nItem 2\nItem 3" : "Enter section content..."}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowModal(false); setEditingSection(null); }}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!editingSection.title || createSection.isPending || updateSection.isPending}
                                className="px-4 py-2 bg-green text-white rounded-md hover:bg-green-hover disabled:opacity-50 flex items-center gap-2"
                            >
                                {(createSection.isPending || updateSection.isPending) && <Spinner size="sm" />}
                                Save Section
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
