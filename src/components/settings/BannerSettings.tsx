import React from 'react';
import { SettingsImageUploader } from '@/components/ui/SettingsImageUploader';

interface BannerSettingsProps {
  formData: {
    bannerText: string;
    highlightedText: string;
    heroBackgroundImage: string;
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

  // Character limits
  const CHAR_LIMITS = {
    bannerText: 150,
    highlightedText: 50,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Banner Settings</h2>

      {/* Hero Background Image */}
      <div>
        <SettingsImageUploader
          label="Hero Background Image"
          value={formData.heroBackgroundImage || ''}
          onChange={(url) => {
            setFormData((prev: any) => ({ ...prev, heroBackgroundImage: url as string }));
            setHasChanges(true);
          }}
          aspectRatio="video"
        />
        <p className="mt-1 text-sm text-gray-500">
          Upload a high-quality landscape image for the hero section background. Recommended: 1920x1080 or larger.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Text
          <span className="text-xs text-gray-500 ml-2">
            ({formData.bannerText.length}/{CHAR_LIMITS.bannerText} characters)
          </span>
        </label>
        <input
          type="text"
          name="bannerText"
          value={formData.bannerText}
          onChange={handleChange}
          maxLength={CHAR_LIMITS.bannerText}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter the main banner text..."
        />
        <p className="mt-1 text-sm text-gray-500">
          This is the main text that appears in the hero section (max {CHAR_LIMITS.bannerText} characters)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Highlighted Text
          <span className="text-xs text-gray-500 ml-2">
            ({formData.highlightedText.length}/{CHAR_LIMITS.highlightedText} characters)
          </span>
        </label>
        <input
          type="text"
          name="highlightedText"
          value={formData.highlightedText}
          onChange={handleChange}
          maxLength={CHAR_LIMITS.highlightedText}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter the text to highlight..."
        />
        <p className="mt-1 text-sm text-gray-500">
          This text will be highlighted in green color within the banner text (max {CHAR_LIMITS.highlightedText} characters)
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
          <li>• Upload a hero background image (landscape, 1920x1080 or larger recommended)</li>
          <li>• The banner text is the main heading displayed on the homepage hero section</li>
          <li>• The highlighted text should be a portion of the banner text that you want to emphasize</li>
          <li>• The highlighted text will appear in green color</li>
          <li>• If the highlighted text is not found within the banner text, it will be added at the end</li>
        </ul>
      </div>
    </div>
  );
}
