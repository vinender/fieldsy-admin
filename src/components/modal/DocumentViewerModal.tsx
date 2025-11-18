import React, { useState } from 'react';
import { X, Download, FileText, Image, ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: any;
  selectedDocument: string;
  onDocumentSelect: (url: string) => void;
}

const PDF_TOOLBAR_PARAMS = 'toolbar=0&navpanes=0&scrollbar=0&view=FitH';

const getPdfSrc = (url: string) => {
  if (!url) return url;
  const [base, hash] = url.split('#');
  if (!hash) {
    return `${base}#${PDF_TOOLBAR_PARAMS}`;
  }
  const connector = hash.endsWith('&') || hash.endsWith('?') ? '' : '&';
  return `${base}#${hash}${connector}${PDF_TOOLBAR_PARAMS}`;
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full h-full sm:max-w-6xl sm:h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
              {claim.field?.name || 'Field'} - Documents
            </h3>
            {documents.length > 0 && (
              <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                {currentDocIndex + 1}/{documents.length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {documents.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Previous document"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Next document"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => handleDownload(currentDoc)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Download document"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Document Display */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {currentDoc ? (
            <div className="w-full h-full p-2 sm:p-4 md:p-6">
              {getFileType(currentDoc) === 'image' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={currentDoc}
                    alt={`Document ${currentDocIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : getFileType(currentDoc) === 'pdf' ? (
                <iframe
                  src={getPdfSrc(currentDoc)}
                  className="w-full h-full rounded-lg shadow-lg bg-white"
                  title="PDF Document"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg mx-2">
                    <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      This document type cannot be displayed in the browser
                    </p>
                    <button
                      onClick={() => handleDownload(currentDoc)}
                      className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Download Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm sm:text-base text-gray-500">No document available</p>
            </div>
          )}
        </div>

        {/* Document Thumbnails (if multiple documents) */}
        {documents.length > 1 && (
          <div className="bg-white border-t px-2 sm:px-4 md:px-6 py-2 sm:py-3 flex-shrink-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-1">
              {documents.map((doc: string, index: number) => {
                const fileType = getFileType(doc);
                const isSelected = index === currentDocIndex;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentDocIndex(index);
                      onDocumentSelect(doc);
                    }}
                    className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    title={`Document ${index + 1}`}
                  >
                    {fileType === 'image' ? (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded overflow-hidden bg-gray-100">
                        <img
                          src={doc}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center bg-gray-100 rounded">
                        <FileText className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${isSelected ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                    )}
                    <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-center ${isSelected ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                      Doc {index + 1}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewerModal;
