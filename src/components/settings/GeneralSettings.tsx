import React from 'react';

interface GeneralSettingsProps {
  formData: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    maxBookingsPerUser: number;
    cancellationWindowHours: number;
    defaultCommissionRate: number;
    maintenanceMode: boolean;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function GeneralSettings({ formData, handleChange }: GeneralSettingsProps) {
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