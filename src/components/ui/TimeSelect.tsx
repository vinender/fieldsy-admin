import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock } from 'lucide-react';

interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function formatTimeDisplay(time24: string): string {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const minute = parseInt(minutes);
  if (isNaN(hour) || isNaN(minute)) return '';
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

export default function TimeSelect({
  value,
  onChange,
  placeholder = 'Select time',
  className = '',
}: TimeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      if (!isNaN(hour) && hour >= 0 && hour <= 23 && !isNaN(minute)) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        setSelectedHour(displayHour.toString());
        setSelectedMinute(minute.toString().padStart(2, '0'));
        setSelectedPeriod(period);
      }
    } else {
      setSelectedHour('');
      setSelectedMinute('');
      setSelectedPeriod('AM');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeSelect = (hour: string, minute: string, period: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);

    let hour24 = parseInt(hour);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    else if (period === 'AM' && hour24 === 12) hour24 = 0;

    const formattedTime = `${hour24.toString().padStart(2, '0')}:${minute}`;
    onChange(formattedTime);
    setIsOpen(false);
  };

  const displayValue = selectedHour && selectedMinute
    ? `${selectedHour}:${selectedMinute} ${selectedPeriod}`
    : '';

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-2.5
          bg-white border border-gray-200 rounded-xl
          text-left text-sm transition-all duration-200
          hover:border-gray-400
          focus:outline-none focus:ring-0 focus:border-[#3A6B22]
          ${isOpen ? 'border-[#3A6B22]' : ''}
          ${!displayValue ? 'text-gray-400' : 'text-gray-900 font-medium'}
        `}
      >
        {displayValue || placeholder}
        <Clock className={`w-4 h-4 ${isOpen ? 'text-[#3A6B22]' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {/* Hours */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2 text-center">Hour</div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {hours.map(hour => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleTimeSelect(hour.toString(), selectedMinute || '00', selectedPeriod)}
                      className={`
                        w-full px-2 py-1.5 text-sm rounded-lg transition-colors
                        ${selectedHour === hour.toString()
                          ? 'bg-[#3A6B22] text-white font-medium'
                          : 'hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2 text-center">Min</div>
                <div className="space-y-0.5">
                  {minutes.map(minute => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleTimeSelect(selectedHour || '12', minute, selectedPeriod)}
                      className={`
                        w-full px-2 py-1.5 text-sm rounded-lg transition-colors
                        ${selectedMinute === minute
                          ? 'bg-[#3A6B22] text-white font-medium'
                          : 'hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div>
                <div className="text-xs font-semibold text-gray-500 mb-2 text-center">Period</div>
                <div className="space-y-0.5">
                  {['AM', 'PM'].map(period => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => handleTimeSelect(selectedHour || '7', selectedMinute || '00', period)}
                      className={`
                        w-full px-2 py-1.5 text-sm rounded-lg transition-colors
                        ${selectedPeriod === period
                          ? 'bg-[#3A6B22] text-white font-medium'
                          : 'hover:bg-gray-100 text-gray-700'}
                      `}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
