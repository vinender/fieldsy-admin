import React from 'react';
import { Label } from '@/components/ui/label';

interface AboutSectionContentSettingsProps {
  formData: {
    aboutSectionTitle: string;
    aboutSectionSubtitle: string;
    aboutSectionMainText: string;
    aboutSectionSecondaryText: string;
    aboutSectionTrustedTitle: string;
    aboutSectionTrustedSubtitle: string;
  };
  setFormData: (data: any) => void;
  setHasChanges: (value: boolean) => void;
}

const CHAR_LIMITS = {
  aboutSectionTitle: 100,
  aboutSectionSubtitle: 150,
  aboutSectionMainText: 300,
  aboutSectionSecondaryText: 300,
  aboutSectionTrustedTitle: 100,
  aboutSectionTrustedSubtitle: 300,
};

export default function AboutSectionContentSettings({
  formData,
  setFormData,
  setHasChanges
}: AboutSectionContentSettingsProps) {
  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About Section Content</h2>
        <p className="text-gray-600 mb-6">Edit the static text content displayed in the About section (below hero on home page)</p>
      </div>

      {/* Left Column - Main Content */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Left Block (Main Content)</h3>
        <p className="text-xs text-blue-800">This content appears in the white card on the left side</p>
      </div>

      <div>
        <Label htmlFor="aboutSectionTitle" className="text-sm font-medium text-gray-700 mb-2 block">
          Main Title
          <span className="text-xs text-gray-500 ml-2">
            ({formData.aboutSectionTitle?.length || 0}/{CHAR_LIMITS.aboutSectionTitle})
          </span>
        </Label>
        <textarea
          id="aboutSectionTitle"
          value={formData.aboutSectionTitle || ''}
          onChange={(e) => handleChange('aboutSectionTitle', e.target.value)}
          maxLength={CHAR_LIMITS.aboutSectionTitle}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-pre-wrap break-words"
          placeholder="e.g., Fieldsy helps dog owners find and book private dog walking fields..."
        />
        <p className="text-xs text-gray-500 mt-1">Bold/prominent text in the card</p>
      </div>

      <div>
        <Label htmlFor="aboutSectionSubtitle" className="text-sm font-medium text-gray-700 mb-2 block">
          Subtitle
          <span className="text-xs text-gray-500 ml-2">
            ({formData.aboutSectionSubtitle?.length || 0}/{CHAR_LIMITS.aboutSectionSubtitle})
          </span>
        </Label>
        <textarea
          id="aboutSectionSubtitle"
          value={formData.aboutSectionSubtitle || ''}
          onChange={(e) => handleChange('aboutSectionSubtitle', e.target.value)}
          maxLength={CHAR_LIMITS.aboutSectionSubtitle}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-pre-wrap break-words"
          placeholder="e.g., Whether your dog needs space for training..."
        />
        <p className="text-xs text-gray-500 mt-1">Secondary text below the main title</p>
      </div>

      {/* Right Column - Trusted Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 mt-8">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Right Block (Trusted Section)</h3>
        <p className="text-xs text-blue-800">This content appears in the white card on the right side with family image</p>
      </div>

      <div>
        <Label htmlFor="aboutSectionTrustedTitle" className="text-sm font-medium text-gray-700 mb-2 block">
          Trusted Title
          <span className="text-xs text-gray-500 ml-2">
            ({formData.aboutSectionTrustedTitle?.length || 0}/{CHAR_LIMITS.aboutSectionTrustedTitle})
          </span>
        </Label>
        <textarea
          id="aboutSectionTrustedTitle"
          value={formData.aboutSectionTrustedTitle || ''}
          onChange={(e) => handleChange('aboutSectionTrustedTitle', e.target.value)}
          maxLength={CHAR_LIMITS.aboutSectionTrustedTitle}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-pre-wrap break-words"
          placeholder="e.g., Trusted by dog owners across the UK"
        />
        <p className="text-xs text-gray-500 mt-1">Main heading for trusted section</p>
      </div>

      <div>
        <Label htmlFor="aboutSectionTrustedSubtitle" className="text-sm font-medium text-gray-700 mb-2 block">
          Trusted Subtitle
          <span className="text-xs text-gray-500 ml-2">
            ({formData.aboutSectionTrustedSubtitle?.length || 0}/{CHAR_LIMITS.aboutSectionTrustedSubtitle})
          </span>
        </Label>
        <textarea
          id="aboutSectionTrustedSubtitle"
          value={formData.aboutSectionTrustedSubtitle || ''}
          onChange={(e) => handleChange('aboutSectionTrustedSubtitle', e.target.value)}
          maxLength={CHAR_LIMITS.aboutSectionTrustedSubtitle}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-pre-wrap break-words"
          placeholder="e.g., Powered by real reviews, easy booking, and a growing network..."
        />
        <p className="text-xs text-gray-500 mt-1">Description below the trusted title</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-semibold text-green-900 mb-2">Preview Note</h4>
        <p className="text-sm text-green-800">
          These text fields control the static content in the About section that appears below the hero section on the home page. Changes appear immediately after saving.
        </p>
      </div>
    </div>
  );
}
