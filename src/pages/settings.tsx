import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { useSystemSettings, useUpdateSystemSettings, useUpdatePlatformImages } from '@/hooks/useSettings';
import { Settings as SettingsIcon, Bell, Save, Check, CheckCircle, XCircle, Type, HelpCircle, Plus, Trash2, Edit2, Image, Layout, X } from 'lucide-react';
import { SettingsImageUploader } from '@/components/ui/SettingsImageUploader';

export default function Settings() {
  const router = useRouter();
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: settings, isLoading: settingsLoading } = useSystemSettings();
  const updateSettingsMutation = useUpdateSystemSettings();
  const updatePlatformImagesMutation = useUpdatePlatformImages();
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    siteName: '',
    siteUrl: '',
    supportEmail: '',
    maxBookingsPerUser: 10,
    cancellationWindowHours: 24,
    defaultCommissionRate: 20,
    enableNotifications: true,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    maintenanceMode: false,
    bannerText: '',
    highlightedText: '',
    aboutTitle: '',
    aboutDogImage: '',
    aboutFamilyImage: '',
    aboutDogIcons: [] as string[],
    platformDogOwnersImage: '',
    platformFieldOwnersImage: '',
    platformTitle: '',
    platformDogOwnersSubtitle: '',
    platformDogOwnersTitle: '',
    platformDogOwnersBullets: [] as string[],
    platformFieldOwnersSubtitle: '',
    platformFieldOwnersTitle: '',
    platformFieldOwnersBullets: [] as string[],
  });
  const [faqs, setFaqs] = useState<any[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [savingFAQs, setSavingFAQs] = useState(false);

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);

  // Load settings data when available
  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || 'Fieldsy',
        siteUrl: settings.siteUrl || 'https://fieldsy.com',
        supportEmail: settings.supportEmail || 'support@fieldsy.com',
        maxBookingsPerUser: settings.maxBookingsPerUser || 10,
        cancellationWindowHours: settings.cancellationWindowHours || 24,
        defaultCommissionRate: settings.defaultCommissionRate || 20,
        enableNotifications: settings.enableNotifications ?? true,
        enableEmailNotifications: settings.enableEmailNotifications ?? true,
        enableSmsNotifications: settings.enableSmsNotifications ?? false,
        maintenanceMode: settings.maintenanceMode || false,
        bannerText: settings.bannerText || 'Find Safe, private dog walking fields',
        highlightedText: settings.highlightedText || 'near you',
        aboutTitle: settings.aboutTitle || 'At Fieldsy, we believe every dog deserves the freedom to run, sniff, and play safely.',
        aboutDogImage: settings.aboutDogImage || '',
        aboutFamilyImage: settings.aboutFamilyImage || '',
        aboutDogIcons: settings.aboutDogIcons || [],
        platformDogOwnersImage: settings.platformDogOwnersImage || '',
        platformFieldOwnersImage: settings.platformFieldOwnersImage || '',
        platformTitle: settings.platformTitle || 'One Platform, Two Tail-Wagging Experiences',
        platformDogOwnersSubtitle: settings.platformDogOwnersSubtitle || 'For Dog Owners:',
        platformDogOwnersTitle: settings.platformDogOwnersTitle || 'Find & Book Private Dog Walking Fields in Seconds',
        platformDogOwnersBullets: settings.platformDogOwnersBullets || ["Stress-free walks for reactive or energetic dogs", "Fully fenced, secure spaces", "GPS-powered search", "Instant hourly bookings"],
        platformFieldOwnersSubtitle: settings.platformFieldOwnersSubtitle || 'For Field Owners:',
        platformFieldOwnersTitle: settings.platformFieldOwnersTitle || "Turn Your Land into a Dog's Dream & Earn",
        platformFieldOwnersBullets: settings.platformFieldOwnersBullets || ["Earn passive income while helping pets", "Host dog owners with full control", "Set your availability and pricing", "List your field for free"],
      });
    }
  }, [settings]);


  useEffect(() => {
    if (admin) {
      fetchFAQs();
    }
  }, [admin]);
  

  const fetchFAQs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faqs/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleAddFAQ = () => {
    setEditingFAQ({ question: '', answer: '', category: 'general', isActive: true });
    setShowFAQModal(true);
  };

  const handleEditFAQ = (faq: any) => {
    setEditingFAQ(faq);
    setShowFAQModal(true);
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/faqs/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setFaqs(faqs.filter(f => f.id !== id));
        setNotification({ type: 'success', message: 'FAQ deleted successfully' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      setNotification({ type: 'error', message: 'Failed to delete FAQ' });
    }
  };

  const handleSaveFAQ = async () => {
    if (!editingFAQ.question || !editingFAQ.answer) {
      setNotification({ type: 'error', message: 'Question and answer are required' });
      return;
    }
    
    try {
      setSavingFAQs(true);
      const token = localStorage.getItem('adminToken');
      const method = editingFAQ.id ? 'PUT' : 'POST';
      const url = editingFAQ.id 
        ? `${process.env.NEXT_PUBLIC_API_URL}/faqs/admin/${editingFAQ.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/faqs/admin`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingFAQ)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (editingFAQ.id) {
          setFaqs(faqs.map(f => f.id === editingFAQ.id ? data.data : f));
        } else {
          setFaqs([...faqs, data.data]);
        }
        setShowFAQModal(false);
        setEditingFAQ(null);
        setNotification({ type: 'success', message: 'FAQ saved successfully' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      setNotification({ type: 'error', message: 'Failed to save FAQ' });
    } finally {
      setSavingFAQs(false);
    }
  };

  if (adminLoading || settingsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
    setHasChanges(true);
  };

  const handleBulletChange = (field: 'platformDogOwnersBullets' | 'platformFieldOwnersBullets', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
    setHasChanges(true);
  };

  const addBullet = (field: 'platformDogOwnersBullets' | 'platformFieldOwnersBullets') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
    setHasChanges(true);
  };

  const removeBullet = (field: 'platformDogOwnersBullets' | 'platformFieldOwnersBullets', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'platform') {
        // Save platform images separately
        await updatePlatformImagesMutation.mutateAsync({
          platformDogOwnersImage: formData.platformDogOwnersImage,
          platformFieldOwnersImage: formData.platformFieldOwnersImage,
          platformTitle: formData.platformTitle,
          platformDogOwnersSubtitle: formData.platformDogOwnersSubtitle,
          platformDogOwnersTitle: formData.platformDogOwnersTitle,
          platformDogOwnersBullets: formData.platformDogOwnersBullets,
          platformFieldOwnersSubtitle: formData.platformFieldOwnersSubtitle,
          platformFieldOwnersTitle: formData.platformFieldOwnersTitle,
          platformFieldOwnersBullets: formData.platformFieldOwnersBullets,
        });
      } else {
        // Save other settings
        await updateSettingsMutation.mutateAsync(formData);
      }
      setNotification({ type: 'success', message: 'Settings saved successfully' });
      setHasChanges(false);
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save settings' });
      console.error('Error saving settings:', error);
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'banner', label: 'Hero Banner', icon: Type },
    { id: 'about', label: 'About Section', icon: Image },
    { id: 'platform', label: 'Platform Section', icon: Layout },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage system settings and preferences</p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`rounded-lg px-4 py-3 flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tabs Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-50 text-green-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {activeTab === 'general' && (
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
              )}

              {activeTab === 'banner' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Banner Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Text
                    </label>
                    <input
                      type="text"
                      name="bannerText"
                      value={formData.bannerText}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter the main banner text..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      This is the main text that appears in the hero section
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Highlighted Text
                    </label>
                    <input
                      type="text"
                      name="highlightedText"
                      value={formData.highlightedText}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter the text to highlight..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      This text will be highlighted in green color within the banner text
                    </p>
                  </div>

                  {/* Preview Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {formData.bannerText && formData.highlightedText ? (
                          formData.bannerText.includes(formData.highlightedText) ? (
                            formData.bannerText.split(formData.highlightedText).map((part, index, array) => (
                              <React.Fragment key={index}>
                                {part}
                                {index < array.length - 1 && (
                                  <span className="text-green font-semibold">{formData.highlightedText}</span>
                                )}
                              </React.Fragment>
                            ))
                          ) : (
                            <>
                              {formData.bannerText} <span className="text-green font-semibold">{formData.highlightedText}</span>
                            </>
                          )
                        ) : (
                          formData.bannerText || 'Enter banner text to see preview'
                        )}
                      </h3>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• The banner text is the main heading displayed on the homepage hero section</li>
                      <li>• The highlighted text should be a portion of the banner text that you want to emphasize</li>
                      <li>• The highlighted text will appear in green color</li>
                      <li>• If the highlighted text is not found within the banner text, it will be added at the end</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About Section Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Title
                    </label>
                    <textarea
                      name="aboutTitle"
                      value={formData.aboutTitle}
                      onChange={(e) => {
                        setFormData({ ...formData, aboutTitle: e.target.value });
                        setHasChanges(true);
                      }}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter the main title for the about section..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      This is the main headline text in the about section
                    </p>
                  </div>

                  <div>
                    <SettingsImageUploader
                      label="Main Dog Image"
                      description="The large dog image displayed on the left side"
                      value={formData.aboutDogImage}
                      onChange={(url) => {
                        setFormData({ ...formData, aboutDogImage: url as string });
                        setHasChanges(true);
                      }}
                      aspectRatio="portrait"
                    />
                  </div>

                  <div>
                    <SettingsImageUploader
                      label="Family/Trust Image"
                      description="The image displayed in the 'Trusted by thousands' section"
                      value={formData.aboutFamilyImage}
                      onChange={(url) => {
                        setFormData({ ...formData, aboutFamilyImage: url as string });
                        setHasChanges(true);
                      }}
                      aspectRatio="video"
                    />
                  </div>

                  <div>
                    <SettingsImageUploader
                      label="Dog Icon Images"
                      description="Small circular dog icons (upload up to 5)"
                      value={formData.aboutDogIcons}
                      onChange={(urls) => {
                        setFormData({ ...formData, aboutDogIcons: urls as string[] });
                        setHasChanges(true);
                      }}
                      multiple={true}
                      maxFiles={5}
                      aspectRatio="square"
                    />
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Image Guidelines:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• All images will be automatically converted to WebP format for better performance</li>
                      <li>• Main dog image should be portrait orientation (3:4 ratio recommended)</li>
                      <li>• Family image should be landscape orientation (16:9 ratio recommended)</li>
                      <li>• Dog icons should be square images, they will be displayed as circles</li>
                      <li>• Maximum file size: 10MB per image</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'platform' && (
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
              )}

              {activeTab === 'faqs' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">FAQ Management</h2>
                    <button
                      onClick={handleAddFAQ}
                      className="flex items-center gap-2 px-4 py-2 bg-green text-white rounded-lg hover:bg-green-hover"
                    >
                      <Plus className="w-4 h-4" />
                      Add FAQ
                    </button>
                  </div>

                  {/* FAQ Categories */}
                  <div className="space-y-4">
                    {['general', 'dog-owners', 'field-owners', 'booking', 'payment'].map(category => {
                      const categoryFaqs = faqs.filter(f => (f.category || 'general') === category);
                      if (categoryFaqs.length === 0 && category !== 'general') return null;
                      
                      return (
                        <div key={category} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-3 capitalize">
                            {category.replace('-', ' ')} ({categoryFaqs.length})
                          </h3>
                          <div className="space-y-2">
                            {categoryFaqs.map((faq, index) => (
                              <div key={faq.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {index + 1}. {faq.question}
                                  </p>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {faq.answer.length > 100 ? faq.answer.substring(0, 100) + '...' : faq.answer}
                                  </p>
                                  <div className="mt-2">
                                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                      faq.isActive 
                                        ? 'bg-green-lighter text-green' 
                                        : 'bg-gray-200 text-gray-600'
                                    }`}>
                                      {faq.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() => handleEditFAQ(faq)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFAQ(faq.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {categoryFaqs.length === 0 && (
                              <p className="text-gray-500 text-sm italic">No FAQs in this category</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Enable Notifications</p>
                        <p className="text-sm text-gray-500">Receive system notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="enableNotifications"
                          checked={formData.enableNotifications}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="enableEmailNotifications"
                          checked={formData.enableEmailNotifications}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="enableSmsNotifications"
                          checked={formData.enableSmsNotifications}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button - Always visible when there are changes */}
              {(activeTab === 'general' || activeTab === 'banner' || activeTab === 'about' || activeTab === 'platform' || activeTab === 'notifications') && (
                <div className={`mt-6 pt-6 border-t ${hasChanges ? 'sticky bottom-0 bg-white pb-6 z-10' : ''}`}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || updateSettingsMutation.isPending || updatePlatformImagesMutation.isPending}
                      className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all transform ${
                        !hasChanges || updateSettingsMutation.isPending || updatePlatformImagesMutation.isPending
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                          : 'bg-green text-white hover:bg-green-700 hover:shadow-lg hover:scale-105 shadow-md'
                      }`}
                    >
                      {(updateSettingsMutation.isPending || updatePlatformImagesMutation.isPending) ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          <span>Saving...</span>
                        </>
                      ) : (updateSettingsMutation.isSuccess || updatePlatformImagesMutation.isSuccess) && !hasChanges ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Saved Successfully</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 text-white" />
                          <span className='text-white'>Save Changes</span>
                        </>
                      )}
                    </button>
                    {hasChanges && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow rounded-full animate-pulse"></div>
                        <p className="text-sm font-medium text-yellow-600">You have unsaved changes</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Modal */}
      {showFAQModal && editingFAQ && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-20 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingFAQ.id ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <button
                onClick={() => {
                  setShowFAQModal(false);
                  setEditingFAQ(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editingFAQ.category || 'general'}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green"
                >
                  <option value="general">General</option>
                  <option value="dog-owners">Dog Owners</option>
                  <option value="field-owners">Field Owners</option>
                  <option value="booking">Booking</option>
                  <option value="payment">Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={editingFAQ.question || ''}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green"
                  placeholder="Enter the question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  value={editingFAQ.answer || ''}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green"
                  rows={4}
                  placeholder="Enter the answer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order (for sorting)
                </label>
                <input
                  type="number"
                  value={editingFAQ.order || 0}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green focus:border-green"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingFAQ.isActive !== false}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, isActive: e.target.checked })}
                  className="h-4 w-4 text-green focus:ring-green border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active (visible to users)
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowFAQModal(false);
                  setEditingFAQ(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFAQ}
                disabled={savingFAQs}
                className="px-4 py-2 bg-green text-white rounded-md hover:bg-green-hover disabled:opacity-50"
              >
                {savingFAQs ? 'Saving...' : 'Save FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}