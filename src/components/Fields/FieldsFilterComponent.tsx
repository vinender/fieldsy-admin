import React, { useState, useEffect } from 'react';

// Filter component with props for flexibility
interface FieldsFilterComponentProps {
  onFiltersChange?: (filters: any) => void;
  initialFilters?: any;
  showApplyButton?: boolean;
  className?: string;
  onClose?: () => void;
}

export default function FieldsFilterComponent({ 
  onFiltersChange = () => {},
  initialFilters = null,
  showApplyButton = false,
  className = "",
  onClose
}: FieldsFilterComponentProps) {
  // State for each filter section
  const [filters, setFilters] = useState(initialFilters || {
    claimStatus: 'All',
    maxDogs: 'All',
    joinedDate: 'All',
    location: ''
  });

  // Notify parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters]);

  // Handle radio button changes
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Reset all filters
  const handleReset = () => {
    const resetFilters = {
      claimStatus: 'All',
      maxDogs: 'All',
      joinedDate: 'All',
      location: ''
    };
    setFilters(resetFilters);
  };

  // Custom Radio Button Component
  const RadioButton = ({ 
    checked, 
    onChange, 
    label, 
    name, 
    value 
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
    name: string;
    value: string;
  }) => {
    return (
      <label className="flex items-center justify-between w-full cursor-pointer py-1 group hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
        <span className="text-sm font-medium text-[#192215] select-none">{label}</span>
        <div className="relative">
          <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="sr-only"
            aria-label={`${name} ${label}`}
          />
          <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
            checked 
              ? 'border-[#3a6b22] bg-[#3a6b22]' 
              : 'border-[#b2b2b2] bg-white hover:border-[#8d8d8d]'
          }`}>
            {checked && (
              <div className="w-2 h-2 rounded-full bg-white"></div>
            )}
          </div>
        </div>
      </label>
    );
  };

  // Filter Section Component for reusability
  const FilterSection = ({ 
    title, 
    options, 
    filterKey 
  }: {
    title: string;
    options: string[];
    filterKey: string;
  }) => (
    <div>
      <h3 className="text-[15px] font-semibold text-[#192215] mb-2 leading-6">
        {title}
      </h3>
      <div className="space-y-2">
        {options.map(option => (
          <RadioButton
            key={option}
            checked={filters[filterKey] === option}
            onChange={() => handleFilterChange(filterKey, option)}
            label={option}
            name={filterKey}
            value={option}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`w-[320px] ${className}`}>
      <div className="bg-white p-4 rounded-2xl shadow-[0px_4px_10px_3px_rgba(0,0,0,0.1)]">
        {/* Filter Title with Reset */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#192215]">Filters</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-xs text-[#3a6b22] hover:text-[#2d5419] font-semibold transition-colors"
            >
              Clear All
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Location Filter */}
          <div>
            <h3 className="text-[15px] font-semibold text-[#192215] mb-2 leading-6">
              Filter by Location
            </h3>
            <input
              type="text"
              placeholder="Enter city name..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a6b22] focus:border-transparent"
            />
          </div>

          {/* Claim Status Section */}
          <FilterSection
            title="Claim Status"
            options={['All', 'Claimed', 'Not Claimed']}
            filterKey="claimStatus"
          />

          {/* Max Dogs Section */}
          <FilterSection
            title="Max Dogs Allowed"
            options={['All', '1-5 Dogs', '6+ Dogs']}
            filterKey="maxDogs"
          />

          {/* Joined Date Section */}
          <FilterSection
            title="Joined Date"
            options={['All', 'This Month', 'Last 3 Months']}
            filterKey="joinedDate"
          />
        </div>

        {/* Optional Apply Button */}
        {showApplyButton && (
          <div className="mt-6">
            <button 
              onClick={() => {
                console.log('Applied filters:', filters);
                if (onClose) onClose();
              }}
              className="w-full bg-[#3a6b22] text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-[#2d5419] active:scale-[0.98] transition-all duration-150"
            >
              Apply Filters
            </button>
          </div>
        )}

        {/* Active Filter Count Badge */}
        {Object.values(filters).filter(v => v !== 'All' && v !== '').length > 0 && (
          <div className="mt-4 p-2 bg-[#3a6b22]/10 rounded-lg">
            <p className="text-xs text-[#3a6b22] font-semibold text-center">
              {Object.values(filters).filter(v => v !== 'All' && v !== '').length} active filter{Object.values(filters).filter(v => v !== 'All' && v !== '').length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}