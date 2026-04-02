import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Step {
  icon?: string;
  title: string;
  description: string;
  order?: number;
}

interface HowItWorksPageSettingsProps {
  formData: {
    howItWorksHeroTitle: string;
    howItWorksHeroHeading: string;
    howItWorksHeroDescription: string;
    forDogOwnersSectionTitle: string;
    forDogOwnersSteps: Step[];
    landownersOptionCard1Title: string;
    landownersOptionCard1Description: string;
    landownersOptionCard2Title: string;
    landownersOptionCard2Description: string;
  };
  setFormData: (data: any) => void;
  setHasChanges: (value: boolean) => void;
}

const DEFAULT_STEPS: Step[] = [
  {
    title: 'Find Fields Near You',
    description: 'Search by postcode or use GPS to discover private, enclosed dog walking fields close to home. Filter by size, price, or amenities to find your perfect match.',
    order: 1
  },
  {
    title: 'Pick a Time Slot',
    description: 'Choose a convenient slot that fits your routine. Book by the hour and enjoy peaceful, scheduled visits with no interruptions or overlapping bookings.',
    order: 2
  },
  {
    title: 'Review Field Details',
    description: 'Check fencing type, field size, terrain, water access, parking, photos, and host notes to make sure the field is right for you and your dog.',
    order: 3
  },
  {
    title: 'Confirm & Pay Securely',
    description: 'Complete your booking with secure, encrypted payment via Stripe. You will receive instant confirmation by email and push notification.',
    order: 4
  },
  {
    title: 'Enjoy Off-Lead Freedom',
    description: 'Arrive at your booked time, let your dog off the lead, and relax. The entire field is exclusively yours for the duration of your session.',
    order: 5
  }
];

const CHAR_LIMITS = {
  heroTitle: 50,
  heroHeading: 100,
  heroDescription: 300,
  sectionTitle: 100,
  stepTitle: 100,
  stepDescription: 300,
  optionCardTitle: 100,
  optionCardDescription: 300,
};

export default function HowItWorksPageSettings({ formData, setFormData, setHasChanges }: HowItWorksPageSettingsProps) {
  const steps = formData.forDogOwnersSteps?.length ? formData.forDogOwnersSteps : DEFAULT_STEPS;

  const updateHeroField = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateForDogOwnersTitle = (value: string) => {
    setFormData((prev: any) => ({ ...prev, forDogOwnersSectionTitle: value }));
    setHasChanges(true);
  };

  const updateStep = (index: number, field: string, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, forDogOwnersSteps: newSteps }));
    setHasChanges(true);
  };

  const addStep = () => {
    const newSteps = [...steps, {
      title: '',
      description: '',
      order: steps.length + 1
    }];
    setFormData((prev: any) => ({ ...prev, forDogOwnersSteps: newSteps }));
    setHasChanges(true);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_: any, i: number) => i !== index)
      .map((step: Step, i: number) => ({ ...step, order: i + 1 }));
    setFormData((prev: any) => ({ ...prev, forDogOwnersSteps: newSteps }));
    setHasChanges(true);
  };

  const updateOptionCard = (cardNumber: 1 | 2, field: 'title' | 'description', value: string) => {
    const fieldName = cardNumber === 1
      ? field === 'title' ? 'landownersOptionCard1Title' : 'landownersOptionCard1Description'
      : field === 'title' ? 'landownersOptionCard2Title' : 'landownersOptionCard2Description';

    setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
    setHasChanges(true);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
            <span className="text-xs text-gray-500 ml-2">
              ({(formData.howItWorksHeroTitle || '').length}/{CHAR_LIMITS.heroTitle})
            </span>
          </label>
          <textarea
            value={formData.howItWorksHeroTitle || 'How It Works'}
            onChange={(e) => updateHeroField('howItWorksHeroTitle', e.target.value)}
            maxLength={CHAR_LIMITS.heroTitle}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical whitespace-pre-wrap break-words"
            placeholder="e.g., How It Works"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Heading
            <span className="text-xs text-gray-500 ml-2">
              ({(formData.howItWorksHeroHeading || '').length}/{CHAR_LIMITS.heroHeading})
            </span>
          </label>
          <textarea
            value={formData.howItWorksHeroHeading || 'Getting Started with Fieldsy'}
            onChange={(e) => updateHeroField('howItWorksHeroHeading', e.target.value)}
            maxLength={CHAR_LIMITS.heroHeading}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical whitespace-pre-wrap break-words"
            placeholder="Main heading text"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
            <span className="text-xs text-gray-500 ml-2">
              ({(formData.howItWorksHeroDescription || '').length}/{CHAR_LIMITS.heroDescription})
            </span>
          </label>
          <textarea
            value={formData.howItWorksHeroDescription || ''}
            onChange={(e) => updateHeroField('howItWorksHeroDescription', e.target.value)}
            maxLength={CHAR_LIMITS.heroDescription}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical whitespace-pre-wrap break-words"
            placeholder="Hero section description"
          />
        </div>
      </div>

      {/* For Dog Owners Section */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">For Dog Owners Section</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Title
            <span className="text-xs text-gray-500 ml-2">
              ({(formData.forDogOwnersSectionTitle || '').length}/{CHAR_LIMITS.sectionTitle})
            </span>
          </label>
          <textarea
            value={formData.forDogOwnersSectionTitle || 'For Dog Owners'}
            onChange={(e) => updateForDogOwnersTitle(e.target.value)}
            maxLength={CHAR_LIMITS.sectionTitle}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical whitespace-pre-wrap break-words"
            placeholder="Section title"
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
            {steps.map((step: Step, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm min-h-[60px] whitespace-pre-wrap break-words"
                    placeholder="Step description"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Landowners Section */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">For Landowners Section - Option Cards</h3>

        {/* Option Card 1 */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
          <span className="text-sm font-semibold text-gray-700">Option Card 1</span>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Title
              <span className="text-xs text-gray-400 ml-1">
                ({(formData.landownersOptionCard1Title || '').length}/{CHAR_LIMITS.optionCardTitle})
              </span>
            </label>
            <textarea
              value={formData.landownersOptionCard1Title || 'Claim Your Existing Listing'}
              onChange={(e) => updateOptionCard(1, 'title', e.target.value)}
              maxLength={CHAR_LIMITS.optionCardTitle}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-vertical whitespace-pre-wrap break-words"
              placeholder="Option card title"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description
              <span className="text-xs text-gray-400 ml-1">
                ({(formData.landownersOptionCard1Description || '').length}/{CHAR_LIMITS.optionCardDescription})
              </span>
            </label>
            <textarea
              value={formData.landownersOptionCard1Description || ''}
              onChange={(e) => updateOptionCard(1, 'description', e.target.value)}
              maxLength={CHAR_LIMITS.optionCardDescription}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm min-h-[60px] whitespace-pre-wrap break-words"
              placeholder="Option card description"
            />
          </div>
        </div>

        {/* Option Card 2 */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
          <span className="text-sm font-semibold text-gray-700">Option Card 2</span>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Title
              <span className="text-xs text-gray-400 ml-1">
                ({(formData.landownersOptionCard2Title || '').length}/{CHAR_LIMITS.optionCardTitle})
              </span>
            </label>
            <textarea
              value={formData.landownersOptionCard2Title || 'List Your Land for Free'}
              onChange={(e) => updateOptionCard(2, 'title', e.target.value)}
              maxLength={CHAR_LIMITS.optionCardTitle}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-vertical whitespace-pre-wrap break-words"
              placeholder="Option card title"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description
              <span className="text-xs text-gray-400 ml-1">
                ({(formData.landownersOptionCard2Description || '').length}/{CHAR_LIMITS.optionCardDescription})
              </span>
            </label>
            <textarea
              value={formData.landownersOptionCard2Description || ''}
              onChange={(e) => updateOptionCard(2, 'description', e.target.value)}
              maxLength={CHAR_LIMITS.optionCardDescription}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm min-h-[60px] whitespace-pre-wrap break-words"
              placeholder="Option card description"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Hero section text appears at the top of the How It Works page</li>
          <li>• For Dog Owners section shows the 5-step process for booking fields</li>
          <li>• For Landowners section displays how to claim or list a field</li>
          <li>• All text supports line breaks for better formatting</li>
        </ul>
      </div>
    </div>
  );
}
