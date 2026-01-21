import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, XCircle, FileText, CheckSquare, Save, GripVertical } from 'lucide-react';
import { useTerms, useCreateTerm, useUpdateTerm, useDeleteTerm, useBulkUpdateTerms, Term } from '@/hooks/useTerms';
import Spinner from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

// Removed props interface as we handle data internally now

export default function TermsSettings() {
    const { data: terms, isLoading, error } = useTerms();
    const createTerm = useCreateTerm();
    const updateTerm = useUpdateTerm();
    const deleteTerm = useDeleteTerm();
    const bulkUpdateTerms = useBulkUpdateTerms(); // For reordering if needed

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingTerm, setEditingTerm] = useState<Partial<Term> | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleAddTerm = () => {
        setEditingIndex(null);
        setEditingTerm({ title: '', content: '', isList: false });
        setShowModal(true);
    };

    const handleEditTerm = (term: Term, index: number) => {
        setEditingIndex(index);
        setEditingTerm({
            ...term,
            content: Array.isArray(term.content) ? term.content.join('\n') : term.content
        });
        setShowModal(true);
    };

    const handleDeleteTerm = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        try {
            await deleteTerm.mutateAsync(id);
            toast.success('Term deleted successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete term');
        }
    };

    const handleSave = async () => {
        // Validation: title is required
        if (!editingTerm || !editingTerm.title) {
            toast.error('Title is required');
            return;
        }

        let contentToSave: string | string[] = editingTerm.content || '';

        if (editingTerm.isList && typeof editingTerm.content === 'string') {
            contentToSave = editingTerm.content.split('\n').filter(line => line.trim() !== '');
        }

        const termData: any = {
            ...editingTerm,
            content: contentToSave
        };

        const toastId = toast.loading('Saving term...');

        try {
            if (editingTerm.id) {
                // Update
                await updateTerm.mutateAsync({ id: editingTerm.id, data: termData });
                toast.success('Term updated successfully', { id: toastId });
            } else {
                // Create
                // Calculate order (append to end)
                const nextOrder = terms ? terms.length : 0;
                await createTerm.mutateAsync({ ...termData, order: nextOrder });
                toast.success('Term created successfully', { id: toastId });
            }
            setShowModal(false);
            setEditingTerm(null);
            setEditingIndex(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to save term', { id: toastId });
        }
    };

    // Helper to handle textarea changes
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (editingTerm) {
            setEditingTerm({ ...editingTerm, content: e.target.value });
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (error) return <div className="text-red-500 p-4">Error loading terms</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Terms & Conditions Management</h2>
                <button
                    onClick={handleAddTerm}
                    className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg hover:bg-green-hover"
                >
                    <Plus className="w-4 h-4" />
                    Add Section
                </button>
            </div>

            <div className="space-y-4">
                {terms && terms.map((term, index) => (
                    <div key={term.id || index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-900">{term.title}</h3>
                                    {term.isList && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            List
                                        </span>
                                    )}
                                </div>

                                {term.isList && Array.isArray(term.content) ? (
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                                        {term.content.slice(0, 3).map((item, i) => (
                                            <li key={i}>{item.length > 80 ? item.substring(0, 80) + '...' : item}</li>
                                        ))}
                                        {term.content.length > 3 && (
                                            <li className="text-gray-400 italic">...and {term.content.length - 3} more items</li>
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-600 whitespace-pre-line">
                                        {typeof term.content === 'string' && term.content.length > 150
                                            ? term.content.substring(0, 150) + '...'
                                            : term.content}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                <button
                                    onClick={() => handleEditTerm(term, index)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteTerm(term.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {(!terms || terms.length === 0) && (
                    <p className="text-center text-gray-500 py-8 italic">No terms sections defined yet.</p>
                )}
            </div>

            {/* Modal */}
            {showModal && editingTerm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4 flex items-center justify-center">
                    <div className="relative mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-xl bg-white max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingTerm.id ? 'Edit Section' : 'Add New Section'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingTerm(null);
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section Title
                                </label>
                                <input
                                    type="text"
                                    value={editingTerm.title || ''}
                                    onChange={(e) => setEditingTerm({ ...editingTerm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green"
                                    placeholder="e.g., 1. About Fieldsy"
                                />
                            </div>

                            <div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingTerm.isList || false}
                                        onChange={(e) => setEditingTerm({ ...editingTerm, isList: e.target.checked })}
                                        className="h-4 w-4 text-green focus:ring-green border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Display as bulleted list</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content
                                    {editingTerm.isList && <span className="text-xs text-gray-500 ml-2">(Enter each list item on a new line)</span>}
                                </label>
                                <textarea
                                    value={editingTerm.content as string || ''}
                                    onChange={handleContentChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green min-h-[200px]"
                                    placeholder={editingTerm.isList ? "Item 1\nItem 2\nItem 3" : "Enter section content..."}
                                />
                            </div>

                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingTerm(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!editingTerm.title || createTerm.isPending || updateTerm.isPending}
                                className="px-4 py-2 bg-green text-white rounded-md hover:bg-green-hover disabled:opacity-50 flex items-center gap-2"
                            >
                                {(createTerm.isPending || updateTerm.isPending) && <Spinner size="sm" />}
                                Save Section
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
