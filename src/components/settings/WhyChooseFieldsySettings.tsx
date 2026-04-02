import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
}

interface WhyChooseFieldsySettingsProps {
  features: Feature[];
  setFeatures: (features: Feature[]) => void;
  setHasChanges: (value: boolean) => void;
}

const CHAR_LIMITS = {
  title: 50,
  description: 150,
};

const DEFAULT_FEATURES = [
  { title: 'Private & Secure Spaces', description: 'All fields are fully enclosed for safe, stress-free visits.' },
  { title: 'Effortless Booking', description: 'Search, select, and reserve in just a few taps anytime, anywhere.' },
  { title: 'GPS-Powered Discovery', description: 'Find nearby dog fields instantly using your location or postcode.' },
  { title: 'Flexible Scheduling', description: 'Book by the hour, on your time—no rigid rules or waiting lists.' },
  { title: 'Trusted Community', description: 'Built by dog lovers, for dog lovers—backed by real users and local field owners.' },
  { title: 'Two Apps, One Mission', description: 'Connecting paws with places whether you walk or host.' },
  { title: 'Simple Booking Management', description: 'Manage availability, bookings, and field access in one easy place.' },
  { title: 'List Your Field', description: 'Promote your secure field to local dog owners.' },
  { title: 'Built to Help You Grow', description: 'Present your field professionally and attract more bookings with less hassle.' }
];

export default function WhyChooseFieldsySettings({ features, setFeatures, setHasChanges }: WhyChooseFieldsySettingsProps) {
  const handleUpdateFeature = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeatures(newFeatures);
    setHasChanges(true);
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = features.filter((_: any, i: number) => i !== index);
    setFeatures(newFeatures);
    setHasChanges(true);
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all features to defaults?')) {
      setFeatures(DEFAULT_FEATURES);
      setHasChanges(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Fieldsy Section</h2>
        <p className="text-gray-600 mb-4">Edit the feature titles and descriptions. Icons are kept consistent.</p>
      </div>

      <div className="space-y-4">
        {features.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-gray-500 text-sm mb-4">No features added. Reset to defaults to get started.</p>
            <Button
              type="button"
              onClick={handleResetToDefaults}
              className="bg-green text-white hover:bg-green-700"
            >
              Reset to Defaults
            </Button>
          </div>
        ) : (
          <>
            {features.map((feature, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Feature {index + 1}</span>
                  <Button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    size="sm"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">
                    Title
                    <span className="text-xs text-gray-400 ml-1">
                      ({feature.title?.length || 0}/{CHAR_LIMITS.title})
                    </span>
                  </Label>
                  <Input
                    value={feature.title}
                    onChange={(e) => handleUpdateFeature(index, 'title', e.target.value)}
                    maxLength={CHAR_LIMITS.title}
                    placeholder="Feature title"
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">
                    Description
                    <span className="text-xs text-gray-400 ml-1">
                      ({feature.description?.length || 0}/{CHAR_LIMITS.description})
                    </span>
                  </Label>
                  <textarea
                    value={feature.description}
                    onChange={(e) => handleUpdateFeature(index, 'description', e.target.value)}
                    maxLength={CHAR_LIMITS.description}
                    placeholder="Feature description"
                    className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[70px] resize-none"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={handleResetToDefaults}
              variant="outline"
              className="w-full"
            >
              Reset to Defaults
            </Button>
          </>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Info:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Icons remain fixed and cannot be changed</li>
          <li>• Edit titles and descriptions for each feature</li>
          <li>• 9 features total displayed in grid (3 columns)</li>
          <li>• Use "Reset to Defaults" to restore original content</li>
        </ul>
      </div>
    </div>
  );
}
