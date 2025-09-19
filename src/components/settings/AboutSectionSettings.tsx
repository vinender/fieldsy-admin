import React from 'react';
import { SettingsImageUploader } from '@/components/ui/SettingsImageUploader';

interface AboutSectionSettingsProps {
  formData: {
    aboutTitle: string;
    aboutDogImage: string;
    aboutFamilyImage: string;
    aboutDogIcons: string[];
  };
  setFormData: (data: any) => void;
  setHasChanges: (value: boolean) => void;
}

export default function AboutSectionSettings({ formData, setFormData, setHasChanges }: AboutSectionSettingsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">About Section Settings</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Main Title
        </label>
        <textarea
          name="aboutTitle"
          value={formData.aboutTitle}
          onChange={(e) => {
            setFormData({ ...formData, aboutTitle: e.target.value });
            setHasChanges(true);
          }}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter the main title for the about section..."
        />
        <p className="mt-1 text-sm text-gray-500">
          This is the main headline text in the about section
        </p>
      </div>

      <div>
        <SettingsImageUploader
          label="Main Dog Image"
          description="The large dog image displayed on the left side"
          value={formData.aboutDogImage}
          onChange={(url) => {
            setFormData({ ...formData, aboutDogImage: url as string });
            setHasChanges(true);
          }}
          aspectRatio="portrait"
        />
      </div>

      <div>
        <SettingsImageUploader
          label="Family/Trust Image"
          description="The image displayed in the 'Trusted by thousands' section"
          value={formData.aboutFamilyImage}
          onChange={(url) => {
            setFormData({ ...formData, aboutFamilyImage: url as string });
            setHasChanges(true);
          }}
          aspectRatio="video"
        />
      </div>

      <div>
        <SettingsImageUploader
          label="Dog Icon Images"
          description="Small circular dog icons (upload up to 5)"
          value={formData.aboutDogIcons}
          onChange={(urls) => {
            setFormData({ ...formData, aboutDogIcons: urls as string[] });
            setHasChanges(true);
          }}
          multiple={true}
          maxFiles={5}
          aspectRatio="square"
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Image Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All images will be automatically converted to WebP format for better performance</li>
          <li>• Main dog image should be portrait orientation (3:4 ratio recommended)</li>
          <li>• Family image should be landscape orientation (16:9 ratio recommended)</li>
          <li>• Dog icons should be square images, they will be displayed as circles</li>
          <li>• Maximum file size: 10MB per image</li>
        </ul>
      </div>
    </div>
  );
}