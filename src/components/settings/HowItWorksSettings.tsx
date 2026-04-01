import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface HowItWorksStep {
  icon: string;
  title: string;
  description: string;
  image: string;
  thumbnail?: string;
  order: number;
}

interface HowItWorksSettingsProps {
  formData: {
    howItWorksTitle: string;
    howItWorksSteps: HowItWorksStep[];
  };
  setFormData: (data: any) => void;
  setHasChanges: (value: boolean) => void;
}

const DEFAULT_STEPS: HowItWorksStep[] = [
  {
    icon: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/how-it-works/field.svg',
    title: 'Find Fields Near You',
    description: 'Easily find trusted, private dog walking fields near you using GPS or postcode search. No more crowded parks—just peaceful, secure spaces tailored for your dog\'s freedom.',
    image: '',
    thumbnail: '/how-it-works/dog.webp',
    order: 1
  },
  {
    icon: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/how-it-works/icon2.svg',
    title: 'Select a Time Slots',
    description: 'Choose from available time slots that work for your schedule.',
    image: '',
    order: 2
  },
  {
    icon: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/how-it-works/icon3.svg',
    title: 'Check Field Details',
    description: 'Review field information, amenities, and safety features.',
    image: '',
    order: 3
  },
  {
    icon: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/how-it-works/icon4.svg',
    title: 'Confirm & Pay Securely',
    description: 'Complete your booking with secure payment processing.',
    image: '',
    order: 4
  },
  {
    icon: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/how-it-works/icon5.svg',
    title: 'Enjoy Off-Lead Freedom',
    description: 'Let your dog run, play, and explore in a safe environment.',
    image: '',
    order: 5
  }
];

const CHAR_LIMITS = {
  title: 100,
  stepTitle: 100,
  stepDescription: 300,
};

export default function HowItWorksSettings({ formData, setFormData, setHasChanges }: HowItWorksSettingsProps) {
  const steps = formData.howItWorksSteps?.length ? formData.howItWorksSteps : DEFAULT_STEPS;

  const updateTitle = (value: string) => {
    setFormData((prev: any) => ({ ...prev, howItWorksTitle: value }));
    setHasChanges(true);
  };

  const updateStep = (index: number, field: keyof HowItWorksStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, howItWorksSteps: newSteps }));
    setHasChanges(true);
  };

  const addStep = () => {
    const newSteps = [...steps, {
      icon: '',
      title: '',
      description: '',
      image: '',
      order: steps.length + 1
    }];
    setFormData((prev: any) => ({ ...prev, howItWorksSteps: newSteps }));
    setHasChanges(true);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_: any, i: number) => i !== index)
      .map((step: HowItWorksStep, i: number) => ({ ...step, order: i + 1 }));
    setFormData((prev: any) => ({ ...prev, howItWorksSteps: newSteps }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works Section</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section Title
          <span className="text-xs text-gray-500 ml-2">
            ({(formData.howItWorksTitle || '').length}/{CHAR_LIMITS.title} characters)
          </span>
        </label>
        <textarea
          value={formData.howItWorksTitle || 'How Fieldsy Works'}
          onChange={(e) => updateTitle(e.target.value)}
          maxLength={CHAR_LIMITS.title}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical whitespace-pre-wrap break-words"
          placeholder="e.g., How Fieldsy Works"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">Steps</label>
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        </div>

        <div className="space-y-4">
          {steps.map((step: HowItWorksStep, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Step {index + 1}</span>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Title
                  <span className="text-xs text-gray-400 ml-1">
                    ({(step.title || '').length}/{CHAR_LIMITS.stepTitle})
                  </span>
                </label>
                <textarea
                  value={step.title}
                  onChange={(e) => updateStep(index, 'title', e.target.value)}
                  maxLength={CHAR_LIMITS.stepTitle}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-vertical whitespace-pre-wrap break-words"
                  placeholder="Step title"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                  <span className="text-xs text-gray-400 ml-1">
                    ({(step.description || '').length}/{CHAR_LIMITS.stepDescription})
                  </span>
                </label>
                <textarea
                  value={step.description}
                  onChange={(e) => updateStep(index, 'description', e.target.value)}
                  maxLength={CHAR_LIMITS.stepDescription}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm min-h-[60px]"
                  placeholder="Step description"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Icon Path
                </label>
                <input
                  type="text"
                  value={step.icon}
                  onChange={(e) => updateStep(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="e.g., /how-it-works/icon1.svg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Each step represents one card in the "How It Works" section on the homepage</li>
          <li>• The title and description appear when a step is active/hovered</li>
          <li>• Icon path should point to an SVG file in the public folder</li>
          <li>• Steps are displayed in the order shown here</li>
        </ul>
      </div>
    </div>
  );
}
