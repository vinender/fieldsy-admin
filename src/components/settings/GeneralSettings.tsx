import React from 'react';
import CustomSelect from '../ui/CustomSelect';

interface GeneralSettingsProps {
  formData: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    maxBookingsPerUser: number;
    cancellationWindowHours: number;
    minimumFieldOperatingHours: number;
    defaultCommissionRate: number;
    payoutReleaseSchedule?: string;
    maintenanceMode: boolean;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function GeneralSettings({ formData, handleChange }: GeneralSettingsProps) {
  const payoutOptions = [
    {
      value: 'immediate',
      label: 'Immediate Release',
      description: 'Release funds as soon as booking is paid'
    },
    {
      value: 'on_weekend',
      label: 'Weekend Release',
      description: 'Release funds on Friday, Saturday, or Sunday'
    },
    {
      value: 'after_cancellation_window',
      label: 'After Cancellation Window',
      description: 'Release funds after the cancellation window expires'
    }
  ];

  const handleSelectChange = (value: string) => {
    // Create a synthetic event to match the existing handleChange signature
    const syntheticEvent = {
      target: {
        name: 'payoutReleaseSchedule',
        value: value,
        type: 'select'
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleChange(syntheticEvent);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Name
        </label>
        <input
          type="text"
          name="siteName"
          value={formData.siteName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site URL
        </label>
        <input
          type="url"
          name="siteUrl"
          value={formData.siteUrl}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Support Email
        </label>
        <input
          type="email"
          name="supportEmail"
          value={formData.supportEmail}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Bookings Per User
          </label>
          <input
            type="number"
            name="maxBookingsPerUser"
            value={formData.maxBookingsPerUser}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cancellation Hours Before Booking
          </label>
          <input
            type="number"
            name="cancellationWindowHours"
            value={formData.cancellationWindowHours}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Field Operating Hours
            <span className="text-xs text-gray-500 ml-1">(Min hours between opening & closing)</span>
          </label>
          <input
            type="number"
            name="minimumFieldOperatingHours"
            value={formData.minimumFieldOperatingHours}
            onChange={handleChange}
            min="1"
            max="24"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commission Rate (%)
        </label>
        <input
          type="number"
          name="defaultCommissionRate"
          value={formData.defaultCommissionRate}
          onChange={handleChange}
          min="0"
          max="100"
          step="0.1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payout Release Schedule
          <span className="text-xs text-gray-500 ml-1">(When to release field owner payments)</span>
        </label>
        <CustomSelect
          options={payoutOptions}
          value={formData.payoutReleaseSchedule || 'after_cancellation_window'}
          onChange={handleSelectChange}
          name="payoutReleaseSchedule"
          placeholder="Select payout schedule"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="maintenanceMode"
          name="maintenanceMode"
          checked={formData.maintenanceMode}
          onChange={handleChange}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
          Enable Maintenance Mode
        </label>
      </div>
    </div>
  );
}