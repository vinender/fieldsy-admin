import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { useSystemSettings, useUpdateSystemSettings, useUpdatePlatformImages } from '@/hooks/useSettings';
import { useAboutPage, useUpdateAboutSection } from '@/hooks/useAboutPage';
import { Settings as SettingsIcon, Bell, Save, Check, CheckCircle, XCircle, Type, HelpCircle, Edit2, Image, Layout } from 'lucide-react';
import toast from 'react-hot-toast';

// Import all settings components
import GeneralSettings from '@/components/settings/GeneralSettings';
import BannerSettings from '@/components/settings/BannerSettings';
import AboutSectionSettings from '@/components/settings/AboutSectionSettings';
import PlatformSettings from '@/components/settings/PlatformSettings';
import AboutPageManagement from '@/components/settings/AboutPageManagement';
import FAQSettings from '@/components/settings/FAQSettings';
import NotificationsSettings from '@/components/settings/NotificationsSettings';

export default function Settings() {
  const router = useRouter();
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: settings, isLoading: settingsLoading } = useSystemSettings();
  const { data: aboutData } = useAboutPage();
  const updateSettingsMutation = useUpdateSystemSettings();
  const updatePlatformImagesMutation = useUpdatePlatformImages();
  const updateAboutSection = useUpdateAboutSection();
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

  // About Page state
  const [aboutHeroSection, setAboutHeroSection] = useState({
    sectionTitle: 'About Us',
    mainTitle: 'Find Safe, Private Dog Walking Fields Near You',
    subtitle: '',
    description: 'At Fieldsy, we believe every dog deserves the freedom to run, sniff, and play safely.',
    image: '/about/dog2.png',
    stats: [] as Array<{ value: string; label: string; order: number }>
  });
  
  const [aboutMissionSection, setAboutMissionSection] = useState({
    title: 'Our Mission',
    description: 'At Fieldsy, we\'re on a mission to create safe, accessible spaces where every dog can enjoy off-lead freedom. We connect dog owners with private, secure fields across the UK—making it easy to find, book, and enjoy peaceful walks away from busy parks and crowded spaces.',
    buttonText: 'Join Our Community',
    image: '/about/mission.png'
  });

  const [aboutWhoWeAreSection, setAboutWhoWeAreSection] = useState<any>({
    title: 'Who We Are',
    description: 'We\'re a passionate team of dog lovers, developers, and outdoor enthusiasts who understand the challenges of finding safe spaces for reactive, nervous, or energetic dogs. With our combined love for technology and animals, we\'ve built Fieldsy to give every dog the freedom they deserve.',
    mainImage: '/about/fam.png',
    rightCardImage: '/about/fam.png',
    rightCardTitle: 'Loved by Paws and People Alike',
    rightCardDescription: 'From tail wags to five-star ratings—Fieldsy is the go-to space for dog lovers to connect, explore, and book safe outdoor spots with ease.',
    features: []
  });

  const [aboutWhatWeDoSection, setAboutWhatWeDoSection] = useState({
    title: 'What We Do',
    subtitle: '',
    description: 'We provide a seamless platform that connects dog owners with private, secure fields for safe off-lead walks and playtime.',
    image: '/about/what-we-do.png',
    features: [] as Array<{ title: string; description: string; order: number }>
  });

  const [aboutWhyFieldsySection, setAboutWhyFieldsySection] = useState<any>({
    title: 'Why Fieldsy?',
    subtitle: 'Choosing Fieldsy means choosing peace of mind for you and freedom for your dog.',
    image: '/about/dog2.png',
    boxTitle: "Let's Build the Future of Field Intelligence",
    boxDescription: "Fieldsy is more than a tool—it's a platform for innovation and transformation in field operations. We're constantly evolving with feedback, and we're here to help you work smarter on-site, every day.",
    buttonText: 'Download App',
    features: [
      { icon: '', title: '', description: '100% secure, fully-fenced fields verified by our team', order: 1 },
      { icon: '', title: '', description: 'Easy booking system - find and reserve in minutes', order: 2 },
      { icon: '', title: '', description: 'Trusted by thousands of dog owners across the UK', order: 3 },
      { icon: '', title: '', description: 'Perfect for reactive, nervous, or energetic dogs', order: 4 }
    ]
  });

  useEffect(() => {
    if (!adminLoading && (adminError || !admin)) {
      router.push('/login');
    }
  }, [admin, adminLoading, adminError, router]);
  
  // Load About page data
  useEffect(() => {
    if (aboutData) {
      console.log('Loading aboutData:', aboutData);
      setAboutHeroSection({
        sectionTitle: aboutData.heroSection?.sectionTitle || 'About Us',
        mainTitle: aboutData.heroSection?.mainTitle || 'Find Safe, Private Dog Walking Fields Near You',
        subtitle: aboutData.heroSection?.subtitle || '',
        description: aboutData.heroSection?.description || 'At Fieldsy, we believe every dog deserves the freedom to run, sniff, and play safely.',
        image: aboutData.heroSection?.image || '/about/dog2.png',
        stats: aboutData.heroSection?.stats || [
          { value: '500+', label: 'Happy Dogs', order: 1 },
          { value: '200+', label: 'Private Fields', order: 2 },
          { value: '50+', label: 'Cities Covered', order: 3 },
          { value: '100%', label: 'Secure Spaces', order: 4 }
        ]
      });
      setAboutMissionSection({
        title: aboutData.missionSection?.title || 'Our Mission',
        description: aboutData.missionSection?.description || 'At Fieldsy, we\'re on a mission to create safe, accessible spaces where every dog can enjoy off-lead freedom. We connect dog owners with private, secure fields across the UK—making it easy to find, book, and enjoy peaceful walks away from busy parks and crowded spaces.',
        buttonText: aboutData.missionSection?.buttonText || 'Join Our Community',
        image: aboutData.missionSection?.image || '/about/mission.png'
      });
      setAboutWhoWeAreSection({
        title: aboutData.whoWeAreSection?.title || 'Who We Are',
        description: aboutData.whoWeAreSection?.description || 'We\'re a passionate team of dog lovers, developers, and outdoor enthusiasts who understand the challenges of finding safe spaces for reactive, nervous, or energetic dogs. With our combined love for technology and animals, we\'ve built Fieldsy to give every dog the freedom they deserve.',
        mainImage: aboutData.whoWeAreSection?.mainImage || '/about/fam.png',
        rightCardImage: aboutData.whoWeAreSection?.rightCardImage || '/about/fam.png',
        rightCardTitle: aboutData.whoWeAreSection?.rightCardTitle || 'Loved by Paws and People Alike',
        rightCardDescription: aboutData.whoWeAreSection?.rightCardDescription || 'From tail wags to five-star ratings—Fieldsy is the go-to space for dog lovers to connect, explore, and book safe outdoor spots with ease.',
        features: aboutData.whoWeAreSection?.features || []
      });
      setAboutWhatWeDoSection({
        title: aboutData.whatWeDoSection?.title || 'What We Do',
        subtitle: aboutData.whatWeDoSection?.subtitle || '',
        description: aboutData.whatWeDoSection?.description || 'We provide a seamless platform that connects dog owners with private, secure fields for safe off-lead walks and playtime.',
        image: aboutData.whatWeDoSection?.image || '/about/what-we-do.png',
        features: aboutData.whatWeDoSection?.features || []
      });
      setAboutWhyFieldsySection({
        title: aboutData.whyFieldsySection?.title || 'Why Fieldsy?',
        subtitle: aboutData.whyFieldsySection?.subtitle || 'Choosing Fieldsy means choosing peace of mind for you and freedom for your dog.',
        image: aboutData.whyFieldsySection?.image || '/about/dog2.png',
        boxTitle: aboutData.whyFieldsySection?.boxTitle || "Let's Build the Future of Field Intelligence",
        boxDescription: aboutData.whyFieldsySection?.boxDescription || "Fieldsy is more than a tool—it's a platform for innovation and transformation in field operations. We're constantly evolving with feedback, and we're here to help you work smarter on-site, every day.",
        buttonText: aboutData.whyFieldsySection?.buttonText || 'Download App',
        features: aboutData.whyFieldsySection?.features || [
          { icon: '', title: '', description: '100% secure, fully-fenced fields verified by our team', order: 1 },
          { icon: '', title: '', description: 'Easy booking system - find and reserve in minutes', order: 2 },
          { icon: '', title: '', description: 'Trusted by thousands of dog owners across the UK', order: 3 },
          { icon: '', title: '', description: 'Perfect for reactive, nervous, or energetic dogs', order: 4 }
        ]
      });
    }
  }, [aboutData]);

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
        aboutDogImage: settings.aboutDogImage || '/about/dog2.png',
        aboutFamilyImage: settings.aboutFamilyImage || '/about/fam.png',
        aboutDogIcons: settings.aboutDogIcons || [],
        platformDogOwnersImage: settings.platformDogOwnersImage || '/platform-section/img1.png',
        platformFieldOwnersImage: settings.platformFieldOwnersImage || '/platform-section/img2.png',
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
    
    const toastId = toast.loading('Deleting FAQ...');
    
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
        toast.success('FAQ deleted successfully', { id: toastId });
        setNotification({ type: 'success', message: 'FAQ deleted successfully' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete FAQ');
      }
    } catch (error: any) {
      console.error('Error deleting FAQ:', error);
      toast.error(error.message || 'Failed to delete FAQ', { id: toastId });
      setNotification({ type: 'error', message: 'Failed to delete FAQ' });
    }
  };

  const handleSaveFAQ = async () => {
    if (!editingFAQ.question || !editingFAQ.answer) {
      toast.error('Question and answer are required');
      setNotification({ type: 'error', message: 'Question and answer are required' });
      return;
    }
    
    const toastId = toast.loading(editingFAQ.id ? 'Updating FAQ...' : 'Creating FAQ...');
    
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
          toast.success('FAQ updated successfully', { id: toastId });
        } else {
          setFaqs([...faqs, data.data]);
          toast.success('FAQ created successfully', { id: toastId });
        }
        setShowFAQModal(false);
        setEditingFAQ(null);
        setNotification({ type: 'success', message: 'FAQ saved successfully' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save FAQ');
      }
    } catch (error: any) {
      console.error('Error saving FAQ:', error);
      toast.error(error.message || 'Failed to save FAQ', { id: toastId });
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

  const handleSave = async () => {
    const toastId = toast.loading('Saving settings...');
    
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
      
      toast.success('Settings saved successfully!', { id: toastId });
      setNotification({ type: 'success', message: 'Settings saved successfully' });
      setHasChanges(false);
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || 
                      error?.response?.data?.message || 
                      error?.message || 
                      'Failed to save settings';
      
      toast.error(errorMsg, { id: toastId });
      setNotification({ type: 'error', message: errorMsg });
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
    { id: 'about-page', label: 'About Us Page', icon: Edit2 },
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
                <GeneralSettings 
                  formData={formData}
                  handleChange={handleChange}
                />
              )}

              {activeTab === 'banner' && (
                <BannerSettings 
                  formData={formData}
                  setFormData={setFormData}
                  setHasChanges={setHasChanges}
                />
              )}

              {activeTab === 'about' && (
                <AboutSectionSettings 
                  formData={formData}
                  setFormData={setFormData}
                  setHasChanges={setHasChanges}
                />
              )}

              {activeTab === 'platform' && (
                <PlatformSettings 
                  formData={formData}
                  setFormData={setFormData}
                  setHasChanges={setHasChanges}
                  handleChange={handleChange}
                />
              )}

              {activeTab === 'about-page' && (
                <AboutPageManagement 
                  aboutData={aboutData}
                  updateAboutSection={updateAboutSection}
                  setNotification={setNotification}
                  aboutHeroSection={aboutHeroSection}
                  setAboutHeroSection={setAboutHeroSection}
                  aboutMissionSection={aboutMissionSection}
                  setAboutMissionSection={setAboutMissionSection}
                  aboutWhoWeAreSection={aboutWhoWeAreSection}
                  setAboutWhoWeAreSection={setAboutWhoWeAreSection}
                  aboutWhatWeDoSection={aboutWhatWeDoSection}
                  setAboutWhatWeDoSection={setAboutWhatWeDoSection}
                  aboutWhyFieldsySection={aboutWhyFieldsySection}
                  setAboutWhyFieldsySection={setAboutWhyFieldsySection}
                />
              )}

              {activeTab === 'faqs' && (
                <FAQSettings 
                  faqs={faqs}
                  setFaqs={setFaqs}
                  handleAddFAQ={handleAddFAQ}
                  handleEditFAQ={handleEditFAQ}
                  handleDeleteFAQ={handleDeleteFAQ}
                  showFAQModal={showFAQModal}
                  setShowFAQModal={setShowFAQModal}
                  editingFAQ={editingFAQ}
                  setEditingFAQ={setEditingFAQ}
                  handleSaveFAQ={handleSaveFAQ}
                  savingFAQs={savingFAQs}
                  setNotification={setNotification}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsSettings 
                  formData={formData}
                  handleChange={handleChange}
                />
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
    </AdminLayout>
  );
}