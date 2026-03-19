import React, { useState, useEffect } from 'react';
import Spinner from '@/components/ui/Spinner';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout/AdminLayout';
import { useVerifyAdmin } from '@/hooks/useAuth';
import { useSystemSettings, useUpdateSystemSettings, useUpdatePlatformImages } from '@/hooks/useSettings';
import { useAboutPage, useUpdateAboutSection } from '@/hooks/useAboutPage';
import { Settings as SettingsIcon, Bell, Save, Check, CheckCircle, XCircle, HelpCircle, Edit2, Home, FileText, BookOpen, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import all settings components
import GeneralSettings from '@/components/settings/GeneralSettings';
import BannerSettings from '@/components/settings/BannerSettings';
import AboutSectionSettings from '@/components/settings/AboutSectionSettings';
import PlatformSettings from '@/components/settings/PlatformSettings';
import HowItWorksSettings from '@/components/settings/HowItWorksSettings';
import AboutPageManagement from '@/components/settings/AboutPageManagement';
import FAQSettings from '@/components/settings/FAQSettings';
import { SettingsImageUploader } from '@/components/ui/SettingsImageUploader';
import NotificationsSettings from '@/components/settings/NotificationsSettings';
import TermsSettings from '@/components/settings/TermsSettings';
import PrivacyPolicySettings from '@/components/settings/PrivacyPolicySettings';

export default function Settings() {
  const router = useRouter();
  const { data: admin, isLoading: adminLoading, error: adminError } = useVerifyAdmin();
  const { data: settings, isLoading: settingsLoading } = useSystemSettings();
  const { data: aboutData } = useAboutPage();
  const updateSettingsMutation = useUpdateSystemSettings();
  const updatePlatformImagesMutation = useUpdatePlatformImages();
  const updateAboutSection = useUpdateAboutSection();
  const [activeTab, setActiveTab] = useState('general');
  const [homePageSubTab, setHomePageSubTab] = useState('hero');
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [formData, setFormData] = useState({
    siteName: '',
    siteUrl: '',
    supportEmail: '',
    adminEmail: '',
    maxBookingsPerUser: 10,
    cancellationWindowHours: 24,
    maxAdvanceBookingDays: 30,
    minimumFieldOperatingHours: 4,
    defaultCommissionRate: 20,
    payoutReleaseSchedule: 'after_cancellation_window',
    enableNotifications: true,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    maintenanceMode: false,
    isLive: true,
    bypassUsername: 'admin',
    bypassPassword: 'fieldsy123',
    bannerText: '',
    highlightedText: '',
    heroBackgroundImage: '',
    heroBackgroundImages: [] as string[],
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
    howItWorksTitle: '',
    howItWorksSteps: [] as any[],
    landownersSectionTitle: '',
    landownersSectionDescription: '',
    landownersSectionImage: '',

  });
  const [faqs, setFaqs] = useState<any[]>([]);
  const [editingFAQ, setEditingFAQ] = useState<any>(null);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [savingFAQs, setSavingFAQs] = useState(false);

  // About Page state
  const [aboutHeroSection, setAboutHeroSection] = useState({
    sectionTitle: 'About Us',
    mainTitle: 'All-in-One Platform for Smarter Field Operations',
    subtitle: '',
    description: 'Fieldsy brings every aspect of field operations into a single, easy-to-use platform. From property claims and terrain tracking to team coordination and document management—we help you digitize, streamline, and scale your fieldwork with confidence. No more juggling spreadsheets, paperwork, or disconnected tools. With Fieldsy, everything you need is at your fingertips, wherever the field takes you.',
    image: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog2.webp',
    stats: [] as Array<{ value: string; label: string; order: number }>
  });

  const [aboutMissionSection, setAboutMissionSection] = useState({
    title: 'Our Mission',
    description: 'At Fieldsy, we\'re on a mission to create safe, accessible spaces where every dog can enjoy off-lead freedom. We connect dog owners with private, secure fields across the UK—making it easy to find, book, and enjoy peaceful walks away from busy parks and crowded spaces.',
    buttonText: 'Join Our Community',
    image: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog2.webp'
  });

  const [aboutWhoWeAreSection, setAboutWhoWeAreSection] = useState<any>({
    title: 'Who We Are',
    description: 'We\'re a passionate team of dog lovers, developers, and outdoor enthusiasts who understand the challenges of finding safe spaces for reactive, nervous, or energetic dogs. With our combined love for technology and animals, we\'ve built Fieldsy to give every dog the freedom they deserve.',
    mainImage: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/fam.webp',
    rightCardImage: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/fam.webp',
    rightCardTitle: 'Loved by Paws and People Alike',
    rightCardDescription: 'From tail wags to five-star ratings—Fieldsy is the go-to space for dog lovers to connect, explore, and book safe outdoor spots with ease.',
    features: []
  });

  const [aboutWhatWeDoSection, setAboutWhatWeDoSection] = useState({
    title: 'What We Do',
    subtitle: '',
    description: 'At Fieldsy, we empower field teams and property managers with the tools they need to work smarter—not harder. Our platform is designed to bring structure, visibility, and control to on-ground operations across real estate, infrastructure, land surveying, and more.',
    image: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog2.webp',
    features: [] as Array<{ title: string; description: string; order: number }>
  });

  const [aboutWhyFieldsySection, setAboutWhyFieldsySection] = useState<any>({
    title: 'Why Fieldsy?',
    subtitle: 'Choosing Fieldsy means choosing peace of mind for you and freedom for your dog.',
    image: 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog2.webp',
    boxTitle: "Let's Build the Future of Field Intelligence",
    boxDescription: "Fieldsy is more than a tool—it's a platform for innovation and transformation in field operations. We're constantly evolving with feedback, and we're here to help you work smarter on-site, every day.",
    buttonText: 'Download App',
    features: [
      { icon: 'CheckCircle', title: 'Secure & Private', description: 'Designed with compliance, transparency, and usability in mind', order: 1 },
      { icon: 'MapPin', title: 'Local & Convenient', description: 'Lightweight, mobile-friendly, and easy to use', order: 2 },
      { icon: 'Calendar', title: 'Flexible Booking', description: 'Scalable across teams, projects, and regions', order: 3 },
      { icon: 'Shield', title: 'Trusted Community', description: 'Built for the field, not just the office', order: 4 }
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
        mainTitle: aboutData.heroSection?.mainTitle || 'All-in-One Platform for Smarter Field Operations',
        subtitle: aboutData.heroSection?.subtitle || '',
        description: aboutData.heroSection?.description || 'Fieldsy brings every aspect of field operations into a single, easy-to-use platform. From property claims and terrain tracking to team coordination and document management—we help you digitize, streamline, and scale your fieldwork with confidence. No more juggling spreadsheets, paperwork, or disconnected tools. With Fieldsy, everything you need is at your fingertips, wherever the field takes you.',
        image: aboutData.heroSection?.image || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog2.webp',
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
        image: aboutData.missionSection?.image || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog2.webp'
      });
      setAboutWhoWeAreSection({
        title: aboutData.whoWeAreSection?.title || 'Who We Are',
        description: aboutData.whoWeAreSection?.description || 'We\'re a passionate team of dog lovers, developers, and outdoor enthusiasts who understand the challenges of finding safe spaces for reactive, nervous, or energetic dogs. With our combined love for technology and animals, we\'ve built Fieldsy to give every dog the freedom they deserve.',
        mainImage: aboutData.whoWeAreSection?.mainImage || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/fam.webp',
        rightCardImage: aboutData.whoWeAreSection?.rightCardImage || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/fam.webp',
        rightCardTitle: aboutData.whoWeAreSection?.rightCardTitle || 'Loved by Paws and People Alike',
        rightCardDescription: aboutData.whoWeAreSection?.rightCardDescription || 'From tail wags to five-star ratings—Fieldsy is the go-to space for dog lovers to connect, explore, and book safe outdoor spots with ease.',
        features: aboutData.whoWeAreSection?.features || []
      });
      setAboutWhatWeDoSection({
        title: aboutData.whatWeDoSection?.title || 'What We Do',
        subtitle: aboutData.whatWeDoSection?.subtitle || '',
        description: aboutData.whatWeDoSection?.description || 'At Fieldsy, we empower field teams and property managers with the tools they need to work smarter—not harder. Our platform is designed to bring structure, visibility, and control to on-ground operations across real estate, infrastructure, land surveying, and more.',
        image: aboutData.whatWeDoSection?.image || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog2.webp',
        features: aboutData.whatWeDoSection?.features || []
      });
      setAboutWhyFieldsySection({
        title: aboutData.whyFieldsySection?.title || 'Why Fieldsy?',
        subtitle: aboutData.whyFieldsySection?.subtitle || 'Choosing Fieldsy means choosing peace of mind for you and freedom for your dog.',
        image: aboutData.whyFieldsySection?.image || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog2.webp',
        boxTitle: aboutData.whyFieldsySection?.boxTitle || "Let's Build the Future of Field Intelligence",
        boxDescription: aboutData.whyFieldsySection?.boxDescription || "Fieldsy is more than a tool—it's a platform for innovation and transformation in field operations. We're constantly evolving with feedback, and we're here to help you work smarter on-site, every day.",
        buttonText: aboutData.whyFieldsySection?.buttonText || 'Download App',
        features: aboutData.whyFieldsySection?.features || [
          { icon: 'CheckCircle', title: 'Secure & Private', description: 'Designed with compliance, transparency, and usability in mind', order: 1 },
          { icon: 'MapPin', title: 'Local & Convenient', description: 'Lightweight, mobile-friendly, and easy to use', order: 2 },
          { icon: 'Calendar', title: 'Flexible Booking', description: 'Scalable across teams, projects, and regions', order: 3 },
          { icon: 'Shield', title: 'Trusted Community', description: 'Built for the field, not just the office', order: 4 }
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
        adminEmail: settings.adminEmail || '',
        maxBookingsPerUser: settings.maxBookingsPerUser || 10,
        cancellationWindowHours: settings.cancellationWindowHours || 24,
        maxAdvanceBookingDays: settings.maxAdvanceBookingDays || 30,
        minimumFieldOperatingHours: settings.minimumFieldOperatingHours || 4,
        defaultCommissionRate: settings.defaultCommissionRate || 20,
        payoutReleaseSchedule: settings.payoutReleaseSchedule || 'after_cancellation_window',
        enableNotifications: settings.enableNotifications ?? true,
        enableEmailNotifications: settings.enableEmailNotifications ?? true,
        enableSmsNotifications: settings.enableSmsNotifications ?? false,
        maintenanceMode: settings.maintenanceMode || false,
        isLive: settings.isLive ?? true,
        bypassUsername: settings.bypassUsername || 'admin',
        bypassPassword: settings.bypassPassword || 'fieldsy123',
        bannerText: settings.bannerText || 'Find Safe, private dog walking fields',
        highlightedText: settings.highlightedText || 'near you',
        heroBackgroundImage: settings.heroBackgroundImage || '',
        heroBackgroundImages: settings.heroBackgroundImages || [],
        aboutTitle: settings.aboutTitle || 'At Fieldsy, we believe every dog deserves the freedom to run, sniff, and play safely.',
        aboutDogImage: settings.aboutDogImage || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/dog2.webp',
        aboutFamilyImage: settings.aboutFamilyImage || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/about/fam.webp',
        aboutDogIcons: settings.aboutDogIcons || [],
        platformDogOwnersImage: settings.platformDogOwnersImage || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/platform-section/img1.webp',
        platformFieldOwnersImage: settings.platformFieldOwnersImage || 'https://fieldsy-s3.s3.eu-west-2.amazonaws.com/defaults/platform-section/img2.webp',
        platformTitle: settings.platformTitle || 'One Platform, Two Tail-Wagging Experiences',
        platformDogOwnersSubtitle: settings.platformDogOwnersSubtitle || 'For Dog Owners:',
        platformDogOwnersTitle: settings.platformDogOwnersTitle || 'Find & Book Private Dog Walking Fields in Seconds',
        platformDogOwnersBullets: settings.platformDogOwnersBullets || ["Stress-free walks for reactive or energetic dogs", "Fully fenced, secure spaces", "GPS-powered search", "Instant hourly bookings"],
        platformFieldOwnersSubtitle: settings.platformFieldOwnersSubtitle || 'For Field Owners:',
        platformFieldOwnersTitle: settings.platformFieldOwnersTitle || "Turn Your Land into a Dog's Dream & Earn",
        platformFieldOwnersBullets: settings.platformFieldOwnersBullets || ["Earn passive income while helping pets", "Host dog owners with full control", "Set your availability and pricing", "List your field for free"],
        howItWorksTitle: settings.howItWorksTitle || 'How Fieldsy Works',
        howItWorksSteps: settings.howItWorksSteps || [],
        landownersSectionTitle: settings.landownersSectionTitle || 'How Fieldsy Works for Landowners',
        landownersSectionDescription: settings.landownersSectionDescription || "List or claim your field, set your schedule, and start earning—it's simple, secure, and flexible.",
        landownersSectionImage: settings.landownersSectionImage || '',

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
        <div className="flex items-center justify-center h-full">
          <Spinner size="md" />
        </div>
      </AdminLayout>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const toastId = toast.loading('Saving settings...');

    try {
      if (activeTab === 'home-page' && homePageSubTab === 'platform') {
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
    { id: 'home-page', label: 'Home Page', icon: Home },
    { id: 'about-page', label: 'About Us Page', icon: Edit2 },
    { id: 'how-it-works-page', label: 'How It Works Page', icon: BookOpen },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'privacy-policy', label: 'Privacy Policy', icon: Shield },
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
          <div className={`rounded-lg px-4 py-3 flex items-center gap-3 ${notification.type === 'success'
            ? 'bg-green-50 text-green border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green" />
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
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                      ? 'bg-green text-white'
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

              {activeTab === 'home-page' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Home Page Settings</h2>
                    <p className="text-gray-600 mt-1">Manage the content displayed on the home page</p>
                  </div>

                  <Tabs value={homePageSubTab} onValueChange={setHomePageSubTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="hero" className="data-[state=active]:bg-green data-[state=active]:text-white">
                        Hero Section
                      </TabsTrigger>
                      <TabsTrigger value="about" className="data-[state=active]:bg-green data-[state=active]:text-white">
                        About Section
                      </TabsTrigger>
                      <TabsTrigger value="how-it-works" className="data-[state=active]:bg-green data-[state=active]:text-white">
                        How It Works
                      </TabsTrigger>
                      <TabsTrigger value="platform" className="data-[state=active]:bg-green data-[state=active]:text-white">
                        Platform Section
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="hero" className="mt-0">
                      <BannerSettings
                        formData={formData}
                        setFormData={setFormData}
                        setHasChanges={setHasChanges}
                      />
                    </TabsContent>

                    <TabsContent value="about" className="mt-0">
                      <AboutSectionSettings
                        formData={formData}
                        setFormData={setFormData}
                        setHasChanges={setHasChanges}
                      />
                    </TabsContent>

                    <TabsContent value="how-it-works" className="mt-0">
                      <HowItWorksSettings
                        formData={formData}
                        setFormData={setFormData}
                        setHasChanges={setHasChanges}
                      />
                    </TabsContent>

                    <TabsContent value="platform" className="mt-0">
                      <PlatformSettings
                        formData={formData}
                        setFormData={setFormData}
                        setHasChanges={setHasChanges}
                        handleChange={handleChange}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
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

              {activeTab === 'how-it-works-page' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">How It Works Page Settings</h2>
                    <p className="text-gray-600 mt-1">Manage the "For Landowners" section on the How It Works page</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title
                      <span className="text-xs text-gray-500 ml-2">
                        ({(formData.landownersSectionTitle || '').length}/150 characters)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formData.landownersSectionTitle || 'How Fieldsy Works for Landowners'}
                      onChange={(e) => {
                        setFormData((prev: any) => ({ ...prev, landownersSectionTitle: e.target.value }));
                        setHasChanges(true);
                      }}
                      maxLength={150}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Description
                      <span className="text-xs text-gray-500 ml-2">
                        ({(formData.landownersSectionDescription || '').length}/500 characters)
                      </span>
                    </label>
                    <textarea
                      value={formData.landownersSectionDescription || "List or claim your field, set your schedule, and start earning—it's simple, secure, and flexible."}
                      onChange={(e) => {
                        setFormData((prev: any) => ({ ...prev, landownersSectionDescription: e.target.value }));
                        setHasChanges(true);
                      }}
                      maxLength={500}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <SettingsImageUploader
                      label="Section Image"
                      description="Image displayed on the left side of the Landowners section"
                      value={formData.landownersSectionImage}
                      onChange={(url) => {
                        setFormData((prev: any) => ({ ...prev, landownersSectionImage: url as string }));
                        setHasChanges(true);
                      }}
                      aspectRatio="portrait"
                    />
                  </div>
                </div>
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

              {activeTab === 'terms' && (
                <TermsSettings />
              )}

              {activeTab === 'privacy-policy' && (
                <PrivacyPolicySettings />
              )}

              {activeTab === 'notifications' && (
                <NotificationsSettings
                  formData={formData}
                  handleChange={handleChange}
                />
              )}

              {/* Save Button - Always visible when there are changes */}
              {(activeTab === 'general' || activeTab === 'home-page' || activeTab === 'how-it-works-page' || activeTab === 'notifications') && (
                <div className={`mt-6 pt-6 border-t ${hasChanges ? 'sticky bottom-0 bg-white pb-6 z-10' : ''}`}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || updateSettingsMutation.isPending || updatePlatformImagesMutation.isPending}
                      className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all transform ${!hasChanges || updateSettingsMutation.isPending || updatePlatformImagesMutation.isPending
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                        : 'bg-green text-white hover:bg-green-700 hover:shadow-lg hover:scale-105 shadow-md'
                        }`}
                    >
                      {(updateSettingsMutation.isPending || updatePlatformImagesMutation.isPending) ? (
                        <>
                          <Spinner size="sm" />
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