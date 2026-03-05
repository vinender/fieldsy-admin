import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { useFieldDetails, useAdminUpdateField, useAdminCreateField, useFieldOptions, useAmenities } from '@/hooks/useFields';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import Spinner from '@/components/ui/Spinner';
import { SettingsImageUploader } from '@/components/ui/SettingsImageUploader';
import TimeSelect from '@/components/ui/TimeSelect';
import AddressAutocomplete from '@/components/ui/AddressAutocomplete';

interface FieldFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  size: string;
  customFieldSize: string;
  terrainType: string;
  fenceType: string;
  fenceSize: string;
  surfaceType: string;
  maxDogs: string;
  openingTime: string;
  closingTime: string;
  operatingDays: string;
  price30min: string;
  price1hr: string;
  amenities: string[];
  images: string[];
  rules: string;
  cancellationPolicy: string;
  entryCode: string;
  isActive: boolean;
  isClaimed: boolean;
  isApproved: boolean;
}

const defaultFormData: FieldFormData = {
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  size: '',
  customFieldSize: '',
  terrainType: '',
  fenceType: '',
  fenceSize: '',
  surfaceType: '',
  maxDogs: '10',
  openingTime: '',
  closingTime: '',
  operatingDays: '',
  price30min: '',
  price1hr: '',
  amenities: [],
  images: [],
  rules: '',
  cancellationPolicy: '',
  entryCode: '',
  isActive: false,
  isClaimed: false,
  isApproved: false,
};

const TABS = [
  { id: 'field-details', label: 'Field Details' },
  { id: 'upload-images', label: 'Upload Images' },
  { id: 'pricing-availability', label: 'Pricing & Availability' },
  { id: 'rules-admin', label: 'Rules & Admin' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function AdminFieldEdit() {
  const router = useRouter();
  const { id } = router.query;
  const isEditing = !!id;

  const { data: admin, isLoading: adminLoading } = useVerifyAdmin();
  const { data: fieldData, isLoading: fieldLoading } = useFieldDetails(id as string);
  const { data: fieldOptions } = useFieldOptions();
  const { data: amenitiesData } = useAmenities();

  const updateMutation = useAdminUpdateField();
  const createMutation = useAdminCreateField();

  const [formData, setFormData] = useState<FieldFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('field-details');

  // Extract options
  const fieldSizeOptions = fieldOptions?.data?.fieldSize || [];
  const terrainTypeOptions = fieldOptions?.data?.terrainType || [];
  const fenceTypeOptions = fieldOptions?.data?.fenceType || [];
  const fenceSizeOptions = fieldOptions?.data?.fenceSize || [];
  const surfaceTypeOptions = fieldOptions?.data?.surfaceType || [];
  const openingDaysOptions = fieldOptions?.data?.openingDays || [];
  const amenitiesList = amenitiesData?.data || amenitiesData?.amenities || [];

  // Populate form when editing
  useEffect(() => {
    if (isEditing && fieldData) {
      const f = fieldData.data || fieldData;
      setFormData({
        name: f.name || '',
        description: f.description || '',
        address: f.address || '',
        city: f.city || '',
        state: f.state || '',
        zipCode: f.zipCode || '',
        size: f.size || '',
        customFieldSize: f.customFieldSize || '',
        terrainType: f.terrainType || '',
        fenceType: f.fenceType || '',
        fenceSize: f.fenceSize || '',
        surfaceType: f.surfaceType || '',
        maxDogs: String(f.maxDogs || 10),
        openingTime: f.openingTime || '',
        closingTime: f.closingTime || '',
        operatingDays: f.operatingDays?.[0] || '',
        price30min: f.price30min ? String(f.price30min) : '',
        price1hr: f.price1hr ? String(f.price1hr) : '',
        amenities: (f.amenities || []).map((a: any) => typeof a === 'string' ? a : a.label || a.name || ''),
        images: f.images || [],
        rules: Array.isArray(f.rules) ? f.rules.join('\n') : (f.rules || ''),
        cancellationPolicy: f.cancellationPolicy || '',
        entryCode: f.entryCode || '',
        isActive: f.isActive || false,
        isClaimed: f.isClaimed || false,
        isApproved: f.isApproved || false,
      });
    }
  }, [isEditing, fieldData]);

  useEffect(() => {
    if (!adminLoading && !admin) {
      router.push('/login');
    }
  }, [admin, adminLoading, router]);

  const timeToMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // If opening time changed and closing time is now at or before it, clear closing time
      if (name === 'openingTime' && updated.closingTime && value) {
        if (timeToMinutes(updated.closingTime) <= timeToMinutes(value)) {
          updated.closingTime = '';
        }
      }
      return updated;
    });
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleAmenityToggle = (amenityName: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityName)
        ? prev.amenities.filter(a => a !== amenityName)
        : [...prev.amenities, amenityName],
    }));
  };

  // Block non-numeric keys for integer inputs
  const blockNonNumeric = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '-', '+', '.'].includes(e.key)) e.preventDefault();
  };

  // Block non-numeric keys but allow one decimal point
  const blockNonNumericAllowDecimal = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '-', '+'].includes(e.key)) e.preventDefault();
  };

  // Get max custom size based on selected field size
  const getCustomSizeMax = (): number => {
    switch (formData.size) {
      case 'small': return 1;
      case 'medium': return 3;
      case 'large': return 20;
      default: return 20;
    }
  };

  const getCustomSizePlaceholder = (): string => {
    switch (formData.size) {
      case 'small': return 'Max 1.0';
      case 'medium': return 'Max 3.0';
      case 'large': return 'Max 20.0';
      default: return '0.1 - 20.0';
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    // Tab 1: Field Details
    if (!formData.name.trim()) e.name = 'Please enter a field name';
    if (!formData.size && !formData.customFieldSize) e.size = 'Please select or enter a field size';
    if (!formData.terrainType) e.terrainType = 'Please select a terrain type';
    if (!formData.fenceType) e.fenceType = 'Please select a fence type';
    if (!formData.fenceSize) e.fenceSize = 'Please select a fence size';
    if (!formData.surfaceType) e.surfaceType = 'Please select a surface type';
    if (!formData.maxDogs) e.maxDogs = 'Please enter the maximum number of dogs allowed';
    if (!formData.description.trim()) e.description = 'Please provide a description of your field';
    if (!formData.address.trim()) e.address = 'Please enter a street address';
    if (!formData.city.trim()) e.city = 'Please enter a city';
    if (!formData.state.trim()) e.state = 'Please enter a county or state';
    if (!formData.zipCode.trim()) e.zipCode = 'Please enter a postal code';
    if (!formData.operatingDays) e.operatingDays = 'Please select your opening days';
    if (!formData.openingTime) e.openingTime = 'Please select a start time';
    if (!formData.closingTime) e.closingTime = 'Please select an end time';
    if (formData.openingTime && formData.closingTime) {
      if (timeToMinutes(formData.closingTime) <= timeToMinutes(formData.openingTime)) {
        e.closingTime = 'Closing time must be after opening time';
      }
    }

    // Tab 2: Images
    if (formData.images.length < 4) {
      const remaining = 4 - formData.images.length;
      e.images = `Please upload at least 4 images (${remaining} more needed)`;
    }

    // Tab 3: Pricing
    const p30 = parseFloat(formData.price30min);
    const p1h = parseFloat(formData.price1hr);
    if ((!p30 || p30 <= 0) && (!p1h || p1h <= 0)) {
      e.pricing = 'Please enter a valid price for at least one slot duration (30 minutes or 1 hour)';
    }

    // Tab 4: Rules
    if (!formData.rules.trim()) e.rules = 'Please specify your booking rules';
    if (!formData.cancellationPolicy.trim()) e.cancellationPolicy = 'Please specify your cancellation policy';

    setErrors(e);

    // Navigate to the first tab with errors
    if (e.name || e.description || e.size || e.terrainType || e.fenceType || e.fenceSize || e.surfaceType || e.maxDogs || e.address || e.city || e.state || e.zipCode) {
      setActiveTab('field-details');
    } else if (e.images) {
      setActiveTab('upload-images');
    } else if (e.pricing || e.operatingDays || e.openingTime || e.closingTime) {
      setActiveTab('pricing-availability');
    } else if (e.rules || e.cancellationPolicy) {
      setActiveTab('rules-admin');
    }

    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSuccessMsg('');

    const payload: Record<string, any> = {
      name: formData.name,
      description: formData.description,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      size: formData.size,
      customFieldSize: formData.customFieldSize,
      terrainType: formData.terrainType,
      fenceType: formData.fenceType,
      fenceSize: formData.fenceSize,
      surfaceType: formData.surfaceType,
      maxDogs: parseInt(formData.maxDogs, 10) || 10,
      openingTime: formData.openingTime,
      closingTime: formData.closingTime,
      operatingDays: formData.operatingDays ? [formData.operatingDays] : [],
      price30min: formData.price30min ? parseFloat(formData.price30min) : null,
      price1hr: formData.price1hr ? parseFloat(formData.price1hr) : null,
      amenities: formData.amenities,
      images: formData.images,
      rules: formData.rules ? formData.rules.split('\n').filter(Boolean) : [],
      cancellationPolicy: formData.cancellationPolicy,
      entryCode: formData.entryCode,
      isActive: formData.isActive,
      isClaimed: formData.isClaimed,
      isApproved: formData.isApproved,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ fieldId: id as string, data: payload });
        setSuccessMsg('Field updated successfully');
      } else {
        const result = await createMutation.mutateAsync(payload);
        setSuccessMsg('Field created successfully');
        const newId = result?.data?.id || result?.data?.fieldId;
        if (newId) {
          router.replace(`/fields/edit?id=${newId}`);
        }
      }
    } catch (err: any) {
      setErrors({ submit: err?.response?.data?.error || err?.message || 'Something went wrong' });
    }
  };

  const isPending = updateMutation.isPending || createMutation.isPending;

  if (adminLoading || (isEditing && fieldLoading)) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  const field = fieldData?.data || fieldData;

  // Count errors per tab for badges
  const tabErrors: Record<TabId, number> = {
    'field-details': ['name', 'description', 'size', 'terrainType', 'fenceType', 'fenceSize', 'surfaceType', 'maxDogs', 'address', 'city', 'state', 'zipCode'].filter(k => errors[k]).length,
    'upload-images': errors.images ? 1 : 0,
    'pricing-availability': ['pricing', 'operatingDays', 'openingTime', 'closingTime'].filter(k => errors[k]).length,
    'rules-admin': ['rules', 'cancellationPolicy'].filter(k => errors[k]).length,
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/fields')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Field' : 'Create New Field'}
              </h1>
              {isEditing && field && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {field.fieldId || field.id?.slice(-6)} &middot; Last edited by {field.lastEditedByRole === 'ADMIN' ? 'Admin' : 'Field Owner'}
                  {field.lastEditedAt && ` on ${new Date(field.lastEditedAt).toLocaleDateString()}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Success / Error Messages */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {successMsg}
          </div>
        )}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {errors.submit}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-0 -mb-px overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-[#3A6B22] text-[#3A6B22]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tabErrors[tab.id] > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {tabErrors[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab 1: Field Details */}
          {activeTab === 'field-details' && (
            <>
              <Section title="Basic Information">
                <FormField label="Field Name" required error={errors.name}>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => {
                      if (e.target.value.length <= 50) handleChange('name', e.target.value);
                    }}
                    className="form-input"
                    placeholder="e.g. Sunny Meadow Dog Field"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.name.length}/50</p>
                </FormField>
                <FormField label="Description" required error={errors.description}>
                  <textarea
                    value={formData.description}
                    onChange={e => {
                      if (e.target.value.length <= 2000) handleChange('description', e.target.value);
                    }}
                    className="form-input min-h-[100px] resize-y"
                    placeholder="Describe the field..."
                    rows={4}
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/2000</p>
                </FormField>
              </Section>

              <Section title="Location">
                <FormField label="Street Address" required error={errors.address}>
                  <AddressAutocomplete
                    value={formData.address}
                    onChange={v => handleChange('address', v)}
                    onAddressSelect={(components) => {
                      const isUK = ['United Kingdom', 'UK', 'GB', 'Great Britain'].includes(components.country);
                      if (!isUK) {
                        setErrors(prev => ({ ...prev, address: 'Please select a UK address only' }));
                        return;
                      }
                      setFormData(prev => ({
                        ...prev,
                        address: components.streetAddress,
                        city: components.city || prev.city,
                        state: components.county || prev.state,
                        zipCode: components.postalCode || prev.zipCode,
                      }));
                      // Clear related errors
                      setErrors(prev => {
                        const n = { ...prev };
                        delete n.address;
                        if (components.city) delete n.city;
                        if (components.county) delete n.state;
                        if (components.postalCode) delete n.zipCode;
                        return n;
                      });
                    }}
                    placeholder="123 Field Lane"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="City" required error={errors.city}>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => handleChange('city', e.target.value)}
                      className="form-input"
                      placeholder="London"
                    />
                  </FormField>
                  <FormField label="County / State" required error={errors.state}>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => handleChange('state', e.target.value)}
                      className="form-input"
                      placeholder="Essex"
                    />
                  </FormField>
                </div>
                <FormField label="Postal Code" required error={errors.zipCode}>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={e => handleChange('zipCode', e.target.value)}
                    className="form-input"
                    placeholder="CO6 2BN"
                  />
                </FormField>
              </Section>

              <Section title="Specifications">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Field Size" required error={errors.size}>
                    <CustomSelect
                      options={fieldSizeOptions}
                      value={formData.size}
                      onChange={v => {
                        setFormData(prev => ({
                          ...prev,
                          size: v,
                          customFieldSize: '', // Clear custom size when dropdown changes
                        }));
                        if (errors.size) {
                          setErrors(prev => { const n = { ...prev }; delete n.size; return n; });
                        }
                      }}
                      placeholder="Select size"
                    />
                  </FormField>
                  <FormField label="Custom Size (acres)" error={errors.customFieldSize}>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.customFieldSize}
                        disabled={formData.size === 'mid-high'}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '') {
                            handleChange('customFieldSize', '');
                            return;
                          }
                          // Allow only 1 decimal place
                          if (!/^\d{0,2}(\.\d{0,1})?$/.test(val)) return;
                          const num = parseFloat(val);
                          const max = getCustomSizeMax();
                          if (!isNaN(num) && num <= max) {
                            handleChange('customFieldSize', val);
                          }
                        }}
                        onKeyDown={blockNonNumericAllowDecimal}
                        className={`form-input pr-14 ${formData.size === 'mid-high' ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                        placeholder={formData.size === 'mid-high' ? '7 acres (exact)' : getCustomSizePlaceholder()}
                        min={0.1}
                        max={getCustomSizeMax()}
                        step={0.1}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">acres</span>
                    </div>
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Terrain Type" required error={errors.terrainType}>
                    <CustomSelect
                      options={terrainTypeOptions}
                      value={formData.terrainType}
                      onChange={v => handleChange('terrainType', v)}
                      placeholder="Select terrain"
                    />
                  </FormField>
                  <FormField label="Surface Type" required error={errors.surfaceType}>
                    <CustomSelect
                      options={surfaceTypeOptions}
                      value={formData.surfaceType}
                      onChange={v => handleChange('surfaceType', v)}
                      placeholder="Select surface"
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Fence Type" required error={errors.fenceType}>
                    <CustomSelect
                      options={fenceTypeOptions}
                      value={formData.fenceType}
                      onChange={v => handleChange('fenceType', v)}
                      placeholder="Select fence type"
                    />
                  </FormField>
                  <FormField label="Fence Size" required error={errors.fenceSize}>
                    <CustomSelect
                      options={fenceSizeOptions}
                      value={formData.fenceSize}
                      onChange={v => handleChange('fenceSize', v)}
                      placeholder="Select fence size"
                    />
                  </FormField>
                </div>
                <FormField label="Max Dogs" required error={errors.maxDogs}>
                  <input
                    type="number"
                    value={formData.maxDogs}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 10)) {
                        handleChange('maxDogs', val);
                      }
                    }}
                    onKeyDown={blockNonNumeric}
                    className="form-input"
                    min={1}
                    max={10}
                  />
                </FormField>
              </Section>
            </>
          )}

          {/* Tab 2: Upload Images */}
          {activeTab === 'upload-images' && (
            <Section title="Field Images">
              <p className="text-sm text-gray-500 -mt-2 mb-4">
                Upload photos of the field. High-quality images help attract more bookings.
              </p>
              <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg border ${formData.images.length >= 4 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                {formData.images.length >= 4 ? (
                  <span className="text-sm font-medium text-green-700">
                    {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} uploaded - You can proceed!
                  </span>
                ) : (
                  <span className="text-sm font-medium text-amber-700">
                    {formData.images.length} of 4 minimum images uploaded - Please upload {4 - formData.images.length} more
                  </span>
                )}
              </div>
              {errors.images && (
                <p className="text-xs text-red-500 mb-3">{errors.images}</p>
              )}
              <SettingsImageUploader
                value={formData.images}
                onChange={(urls) => {
                  handleChange('images', Array.isArray(urls) ? urls : urls ? [urls] : []);
                }}
                multiple={true}
                maxFiles={10}
                label=""
                description=""
              />
            </Section>
          )}

          {/* Tab 3: Pricing & Availability */}
          {activeTab === 'pricing-availability' && (
            <>
              <Section title="Opening Hours">
                <FormField label="Opening Days" required error={errors.operatingDays}>
                  <CustomSelect
                    options={openingDaysOptions}
                    value={formData.operatingDays}
                    onChange={v => handleChange('operatingDays', v)}
                    placeholder="Select days"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Opening Time" required error={errors.openingTime}>
                    <TimeSelect
                      value={formData.openingTime}
                      onChange={v => handleChange('openingTime', v)}
                      placeholder="Select opening time"
                    />
                  </FormField>
                  <FormField label="Closing Time" required error={errors.closingTime}>
                    <TimeSelect
                      value={formData.closingTime}
                      onChange={v => handleChange('closingTime', v)}
                      placeholder="Select closing time"
                      minTime={formData.openingTime || undefined}
                    />
                  </FormField>
                </div>
              </Section>

              <Section title="Pricing">
                {errors.pricing && (
                  <p className="text-xs text-red-500 -mt-2 mb-3">{errors.pricing}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Price (30 min)">
                    <div className="relative">
                      <span className="absolute left-0 px-1 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">£</span>
                      <input
                        type="number"
                        value={formData.price30min}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 100)) {
                            handleChange('price30min', val);
                          }
                        }}
                        onKeyDown={blockNonNumeric}
                        className="form-input px-8"
                        placeholder="0"
                        min={0}
                        max={100}
                      />
                    </div>
                  </FormField>
                  <FormField label="Price (1 hour)">
                    <div className="relative">
                      <span className="absolute left-0 px-1 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">£</span>
                      <input
                        type="number"
                        value={formData.price1hr}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 100)) {
                            handleChange('price1hr', val);
                          }
                        }}
                        onKeyDown={blockNonNumeric}
                        className="form-input px-8"
                        placeholder="0"
                        min={0}
                        max={100}
                      />
                    </div>
                  </FormField>
                </div>
                <FormField label="Entry Code">
                  <input
                    type="text"
                    value={formData.entryCode}
                    onChange={e => handleChange('entryCode', e.target.value)}
                    className="form-input font-mono"
                    placeholder="e.g. 1234"
                  />
                </FormField>
              </Section>
            </>
          )}

          {/* Tab 4: Rules & Admin */}
          {activeTab === 'rules-admin' && (
            <>
              <Section title="Amenities">
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((amenity: any) => {
                    const name = amenity.label || amenity.name || amenity;
                    const isSelected = formData.amenities.includes(name);
                    return (
                      <button
                        key={amenity.id || name}
                        type="button"
                        onClick={() => handleAmenityToggle(name)}
                        className={`px-3 py-2 rounded-xl text-sm border border-1 transition-colors outline-none ${
                          isSelected
                            ? 'bg-[#E8F5E0] border-[#3A6B22] text-[#3A6B22] font-medium'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                  {amenitiesList.length === 0 && (
                    <p className="text-sm text-gray-400">Loading amenities...</p>
                  )}
                </div>
              </Section>

              <Section title="Rules & Policies">
                <FormField label="Community Rules" required error={errors.rules} hint="One rule per line">
                  <textarea
                    value={formData.rules}
                    onChange={e => {
                      if (e.target.value.length <= 2000) handleChange('rules', e.target.value);
                    }}
                    className="form-input min-h-[100px] resize-y"
                    placeholder="Dogs must be leashed when entering..."
                    rows={4}
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.rules.length}/2000</p>
                </FormField>
                <FormField label="Cancellation Policy" required error={errors.cancellationPolicy}>
                  <textarea
                    value={formData.cancellationPolicy}
                    onChange={e => {
                      if (e.target.value.length <= 2000) handleChange('cancellationPolicy', e.target.value);
                    }}
                    className="form-input min-h-[80px] resize-y"
                    placeholder="Free cancellation up to 12 hours before..."
                    rows={3}
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.cancellationPolicy.length}/2000</p>
                </FormField>
              </Section>

              <Section title="Admin Controls">
                <div className="flex flex-wrap gap-6">
                  <ToggleField
                    label="Active"
                    checked={formData.isActive}
                    onChange={v => handleChange('isActive', v)}
                  />
                  <ToggleField
                    label="Claimed"
                    checked={formData.isClaimed}
                    onChange={v => handleChange('isClaimed', v)}
                  />
                  <ToggleField
                    label="Approved"
                    checked={formData.isApproved}
                    onChange={v => handleChange('isApproved', v)}
                  />
                </div>
              </Section>
            </>
          )}

          {/* Submit - always visible */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push('/fields')}
              className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3A6B22] text-white rounded-xl font-medium hover:bg-[#2d5519] transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Save Changes' : 'Create Field'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          background: white;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none !important;
          -webkit-appearance: none;
        }
        .form-input:focus,
        .form-input:focus-visible,
        .form-input:active {
          border-color: #3A6B22;
          box-shadow: 0 0 0 2px rgba(58, 107, 34, 0.15);
          outline: none !important;
        }
        .form-input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </AdminLayout>
  );
}

// Helper components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({ label, required, error, hint, children }: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        style={{ backgroundColor: checked ? '#3A6B22' : '#e5e7eb' }}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}
