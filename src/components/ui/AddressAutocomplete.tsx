import React, { useEffect, useRef, useState } from 'react';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

export interface AddressComponents {
  streetAddress: string;
  city: string;
  county: string;
  postalCode: string;
  country: string;
  lat: number | null;
  lng: number | null;
  formatted_address: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  border: '1px solid #e5e7eb',
  borderRadius: '0.75rem',
  fontSize: '0.875rem',
  background: 'white',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  outline: 'none',
};

const inputFocusStyle: React.CSSProperties = {
  borderColor: '#3A6B22',
  boxShadow: '0 0 0 2px rgba(58, 107, 34, 0.15)',
  outline: 'none',
};

interface AddressAutocompleteProps {
  value?: string;
  onAddressSelect?: (components: AddressComponents) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AddressAutocomplete({
  value = '',
  onAddressSelect,
  onChange,
  placeholder = '123 Field Lane',
  className = '',
}: AddressAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = (instance: google.maps.places.Autocomplete) => {
    setAutocomplete(instance);
    instance.setOptions({
      componentRestrictions: { country: 'gb' },
      types: ['address'],
      fields: ['address_components', 'formatted_address', 'geometry'],
    });
  };

  const onPlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();

    if (place && place.address_components && onAddressSelect) {
      const components: AddressComponents = {
        streetAddress: '',
        city: '',
        county: '',
        postalCode: '',
        country: '',
        lat: place.geometry?.location?.lat() || null,
        lng: place.geometry?.location?.lng() || null,
        formatted_address: place.formatted_address || '',
      };

      let streetNumber = '';
      let route = '';

      place.address_components.forEach((c) => {
        const types = c.types;
        if (types.includes('street_number')) streetNumber = c.long_name;
        if (types.includes('route')) route = c.long_name;
        if (types.includes('locality') || types.includes('postal_town')) components.city = c.long_name;
        if (types.includes('administrative_area_level_2')) components.county = c.long_name;
        if (types.includes('administrative_area_level_1') && !components.county) components.county = c.long_name;
        if (types.includes('postal_code')) components.postalCode = c.long_name;
        if (types.includes('country')) components.country = c.long_name;
      });

      components.streetAddress = streetNumber ? `${streetNumber} ${route}` : route;

      onChange?.(components.streetAddress);
      onAddressSelect(components);
    }
  };

  // Style the Google Places dropdown to match admin theme
  useEffect(() => {
    if (!isLoaded) return;
    const style = document.createElement('style');
    style.innerHTML = `
      .pac-container {
        font-family: system-ui, -apple-system, sans-serif !important;
        border-radius: 12px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important;
        border: 1px solid #e5e7eb !important;
        overflow: hidden !important;
        margin-top: 6px !important;
        z-index: 10000 !important;
      }
      .pac-container::after { display: none !important; }
      .pac-item {
        padding: 12px 16px !important;
        border-bottom: 1px solid #f3f4f6 !important;
        color: #111827 !important;
        cursor: pointer;
        font-size: 14px !important;
        line-height: 1.5 !important;
      }
      .pac-item:hover { background-color: #f0fdf4 !important; }
      .pac-item-selected, .pac-item-selected:hover { background-color: #f0fdf4 !important; }
      .pac-item:last-child { border-bottom: 0 !important; }
      .pac-item-query { font-weight: 600 !important; color: #111827 !important; font-size: 14px !important; }
      .pac-matched { font-weight: 600 !important; color: #3A6B22 !important; }
      .pac-icon, .pac-icon-marker { display: none !important; }
      .pac-logo::after { display: none !important; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [isLoaded]);

  const mergedStyle = focused ? { ...inputStyle, ...inputFocusStyle } : inputStyle;

  if (loadError) {
    return (
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={mergedStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
      />
    );
  }

  if (!isLoaded) {
    return (
      <input
        type="text"
        placeholder="Loading..."
        style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
        disabled
      />
    );
  }

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={mergedStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
      />
    </Autocomplete>
  );
}
