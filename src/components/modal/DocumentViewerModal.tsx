import React, { useState } from 'react';
import { X, Download, FileText, Image, ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: any;
  selectedDocument: string;
  onDocumentSelect: (url: string) => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  claim,
  selectedDocument,
  onDocumentSelect,
}) => {
  const [currentDocIndex, setCurrentDocIndex] = useState(0);

  if (!isOpen) return null;

  const documents = claim?.documents || [];
  const currentDoc = selectedDocument || documents[currentDocIndex];

  const handlePrevious = () => {
    const newIndex = currentDocIndex > 0 ? currentDocIndex - 1 : documents.length - 1;
    setCurrentDocIndex(newIndex);
    onDocumentSelect(documents[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentDocIndex < documents.length - 1 ? currentDocIndex + 1 : 0;
    setCurrentDocIndex(newIndex);
    onDocumentSelect(documents[newIndex]);
  };

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else {
      return 'other';
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop() || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Document Viewer</h3>
            <div className="text-sm text-gray-500">
              Document {currentDocIndex + 1} of {documents.length}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {documents.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => handleDownload(currentDoc)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex">
          {/* Sidebar with document list */}
          <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Documents</h4>
            <div className="space-y-2">
              {documents.map((doc: string, index: number) => {
                const fileType = getFileType(doc);
                const fileName = doc.split('/').pop() || `Document ${index + 1}`;
                const isSelected = index === currentDocIndex;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentDocIndex(index);
                      onDocumentSelect(doc);
                    }}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {fileType === 'image' ? (
                      <Image className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-sm truncate">{fileName}</span>
                  </button>
                );
              })}
            </div>

            {/* Claim Info */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Claim Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Claimant:</span>
                  <p className="text-gray-900">{claim.fullName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{claim.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <p className="text-gray-900">
                    {claim.phoneCode} {claim.phoneNumber}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Legal Owner:</span>
                  <p className="text-gray-900">{claim.isLegalOwner ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <p className={`font-semibold ${
                    claim.status === 'APPROVED' ? 'text-green-600' :
                    claim.status === 'REJECTED' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {claim.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Display */}
          <div className="flex-1 overflow-auto max-h-[calc(90vh-80px)] bg-gray-100">
            {currentDoc ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                {getFileType(currentDoc) === 'image' ? (
                  <img
                    src={currentDoc}
                    alt="Document"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                ) : getFileType(currentDoc) === 'pdf' ? (
                  <iframe
                    src={currentDoc}
                    className="w-full h-full rounded-lg shadow-lg bg-white"
                    title="PDF Document"
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      This document type cannot be displayed in the browser
                    </p>
                    <button
                      onClick={() => handleDownload(currentDoc)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Document
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">No document selected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;