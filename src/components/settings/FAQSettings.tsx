import React from 'react';
import { Plus, Edit2, Trash2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FAQSettingsProps {
  faqs: any[];
  setFaqs: (faqs: any[]) => void;
  handleAddFAQ: () => void;
  handleEditFAQ: (faq: any) => void;
  handleDeleteFAQ: (id: string) => void;
  showFAQModal: boolean;
  setShowFAQModal: (show: boolean) => void;
  editingFAQ: any;
  setEditingFAQ: (faq: any) => void;
  handleSaveFAQ: () => void;
  savingFAQs: boolean;
  setNotification: (notification: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function FAQSettings({
  faqs,
  setFaqs,
  handleAddFAQ,
  handleEditFAQ,
  handleDeleteFAQ,
  showFAQModal,
  setShowFAQModal,
  editingFAQ,
  setEditingFAQ,
  handleSaveFAQ,
  savingFAQs,
  setNotification
}: FAQSettingsProps) {
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">FAQ Management</h2>
          <button
            onClick={handleAddFAQ}
            className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg hover:bg-green-hover"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-4">
          {['general', 'dog-owners', 'field-owners', 'booking', 'payment'].map(category => {
            const categoryFaqs = faqs.filter(f => (f.category || 'general') === category);
            if (categoryFaqs.length === 0 && category !== 'general') return null;
            
            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 capitalize">
                  {category.replace('-', ' ')} ({categoryFaqs.length})
                </h3>
                <div className="space-y-2">
                  {categoryFaqs.map((faq, index) => (
                    <div key={faq.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {index + 1}. {faq.question}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {faq.answer.length > 100 ? faq.answer.substring(0, 100) + '...' : faq.answer}
                        </p>
                        <div className="mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            faq.isActive 
                              ? 'bg-green-lighter text-green' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {faq.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditFAQ(faq)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {categoryFaqs.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No FAQs in this category</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Modal */}
      {showFAQModal && editingFAQ && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingFAQ.id ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <button
                onClick={() => {
                  setShowFAQModal(false);
                  setEditingFAQ(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editingFAQ.category || 'general'}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green"
                >
                  <option value="general">General</option>
                  <option value="dog-owners">Dog Owners</option>
                  <option value="field-owners">Field Owners</option>
                  <option value="booking">Booking</option>
                  <option value="payment">Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={editingFAQ.question || ''}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green"
                  placeholder="Enter the question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  value={editingFAQ.answer || ''}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green"
                  rows={4}
                  placeholder="Enter the answer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order (for sorting)
                </label>
                <input
                  type="number"
                  value={editingFAQ.order || 0}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingFAQ.isActive !== false}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, isActive: e.target.checked })}
                  className="h-4 w-4 text-green focus:ring-green border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active (visible to users)
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowFAQModal(false);
                  setEditingFAQ(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFAQ}
                disabled={savingFAQs}
                className="px-4 py-2 bg-green text-white rounded-md hover:bg-green-hover disabled:opacity-50"
              >
                {savingFAQs ? 'Saving...' : 'Save FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}