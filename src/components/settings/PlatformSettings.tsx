import React from 'react';
import { SettingsImageUploader } from '@/components/ui/SettingsImageUploader';
import { Plus, X } from 'lucide-react';

interface PlatformSettingsProps {
  formData: {
    platformTitle: string;
    platformDogOwnersImage: string;
    platformFieldOwnersImage: string;
    platformDogOwnersSubtitle: string;
    platformDogOwnersTitle: string;
    platformDogOwnersBullets: string[];
    platformFieldOwnersSubtitle: string;
    platformFieldOwnersTitle: string;
    platformFieldOwnersBullets: string[];
  };
  setFormData: (data: any) => void;
  setHasChanges: (value: boolean) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PlatformSettings({ 
  formData, 
  setFormData, 
  setHasChanges,
  handleChange 
}: PlatformSettingsProps) {
  
  const handleBulletChange = (field: 'platformDogOwnersBullets' | 'platformFieldOwnersBullets', index: number, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
    setHasChanges(true);
  };

  const addBullet = (field: 'platformDogOwnersBullets' | 'platformFieldOwnersBullets') => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
    setHasChanges(true);
  };

  const removeBullet = (field: 'platformDogOwnersBullets' | 'platformFieldOwnersBullets', index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: string, i: number) => i !== index)
    }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Section Settings</h2>
      
      {/* Main Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section Title
        </label>
        <input
          type="text"
          name="platformTitle"
          value={formData.platformTitle}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter the main platform section title..."
        />
      </div>

      {/* Dog Owners Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900">Dog Owners Card</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle (Green Text)
          </label>
          <input
            type="text"
            name="platformDogOwnersSubtitle"
            value={formData.platformDogOwnersSubtitle}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., For Dog Owners:"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            name="platformDogOwnersTitle"
            value={formData.platformDogOwnersTitle}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter the dog owners card title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features / Bullet Points
          </label>
          <div className="space-y-2">
            {formData.platformDogOwnersBullets.map((bullet, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => handleBulletChange('platformDogOwnersBullets', index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter bullet point..."
                />
                <button
                  onClick={() => removeBullet('platformDogOwnersBullets', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove bullet"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addBullet('platformDogOwnersBullets')}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green hover:text-green transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Bullet Point
            </button>
          </div>
        </div>

        <div>
          <SettingsImageUploader
            label="Card Image"
            description="Image displayed on the dog owners platform card"
            value={formData.platformDogOwnersImage}
            onChange={(url) => {
              setFormData({ ...formData, platformDogOwnersImage: url as string });
              setHasChanges(true);
            }}
            aspectRatio="video"
          />
        </div>
      </div>

      {/* Field Owners Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900">Field Owners Card</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle (Green Text)
          </label>
          <input
            type="text"
            name="platformFieldOwnersSubtitle"
            value={formData.platformFieldOwnersSubtitle}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., For Field Owners:"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            name="platformFieldOwnersTitle"
            value={formData.platformFieldOwnersTitle}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter the field owners card title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features / Bullet Points
          </label>
          <div className="space-y-2">
            {formData.platformFieldOwnersBullets.map((bullet, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => handleBulletChange('platformFieldOwnersBullets', index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter bullet point..."
                />
                <button
                  onClick={() => removeBullet('platformFieldOwnersBullets', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove bullet"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addBullet('platformFieldOwnersBullets')}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green hover:text-green transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Bullet Point
            </button>
          </div>
        </div>

        <div>
          <SettingsImageUploader
            label="Card Image"
            description="Image displayed on the field owners platform card"
            value={formData.platformFieldOwnersImage}
            onChange={(url) => {
              setFormData({ ...formData, platformFieldOwnersImage: url as string });
              setHasChanges(true);
            }}
            aspectRatio="video"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Platform card images should be landscape orientation (16:9 ratio recommended)</li>
          <li>• The subtitle appears in green color above the main title</li>
          <li>• Keep titles concise and impactful</li>
          <li>• All images will be automatically converted to WebP format</li>
          <li>• Maximum file size: 10MB per image</li>
        </ul>
      </div>
    </div>
  );
}