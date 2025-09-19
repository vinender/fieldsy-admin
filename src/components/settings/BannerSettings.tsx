import React from 'react';

interface BannerSettingsProps {
  formData: {
    bannerText: string;
    highlightedText: string;
  };
  setFormData: (data: any) => void;
  setHasChanges: (value: boolean) => void;
}

export default function BannerSettings({ formData, setFormData, setHasChanges }: BannerSettingsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Banner Settings</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Text
        </label>
        <input
          type="text"
          name="bannerText"
          value={formData.bannerText}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter the main banner text..."
        />
        <p className="mt-1 text-sm text-gray-500">
          This is the main text that appears in the hero section
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Highlighted Text
        </label>
        <input
          type="text"
          name="highlightedText"
          value={formData.highlightedText}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter the text to highlight..."
        />
        <p className="mt-1 text-sm text-gray-500">
          This text will be highlighted in green color within the banner text
        </p>
      </div>

      {/* Preview Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {formData.bannerText && formData.highlightedText ? (
              formData.bannerText.includes(formData.highlightedText) ? (
                formData.bannerText.split(formData.highlightedText).map((part, index, array) => (
                  <React.Fragment key={index}>
                    {part}
                    {index < array.length - 1 && (
                      <span className="text-green font-semibold">{formData.highlightedText}</span>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <>
                  {formData.bannerText} <span className="text-green font-semibold">{formData.highlightedText}</span>
                </>
              )
            ) : (
              formData.bannerText || 'Enter banner text to see preview'
            )}
          </h3>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• The banner text is the main heading displayed on the homepage hero section</li>
          <li>• The highlighted text should be a portion of the banner text that you want to emphasize</li>
          <li>• The highlighted text will appear in green color</li>
          <li>• If the highlighted text is not found within the banner text, it will be added at the end</li>
        </ul>
      </div>
    </div>
  );
}