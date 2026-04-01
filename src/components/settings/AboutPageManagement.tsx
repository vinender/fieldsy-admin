import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Save, Loader, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SettingsImageUploader } from '@/components/ui/SettingsImageUploader';
import Spinner from '@/components/ui/Spinner';

interface AboutPageManagementProps {
  aboutData: any;
  updateAboutSection: any;
  setNotification: (notification: { type: 'success' | 'error'; message: string } | null) => void;
  aboutHeroSection: any;
  setAboutHeroSection: (data: any) => void;
  aboutMissionSection: any;
  setAboutMissionSection: (data: any) => void;
  aboutWhoWeAreSection: any;
  setAboutWhoWeAreSection: (data: any) => void;
  aboutWhatWeDoSection: any;
  setAboutWhatWeDoSection: (data: any) => void;
  aboutWhyFieldsySection: any;
  setAboutWhyFieldsySection: (data: any) => void;
}

export default function AboutPageManagement({
  aboutData,
  updateAboutSection,
  setNotification,
  aboutHeroSection,
  setAboutHeroSection,
  aboutMissionSection,
  setAboutMissionSection,
  aboutWhoWeAreSection,
  setAboutWhoWeAreSection,
  aboutWhatWeDoSection,
  setAboutWhatWeDoSection,
  aboutWhyFieldsySection,
  setAboutWhyFieldsySection
}: AboutPageManagementProps) {

  // Character limits
  const CHAR_LIMITS = {
    sectionTitle: 100,
    mainTitle: 200,
    title: 150,
    subtitle: 200,
    description: 500,
    statValue: 20,
    statLabel: 50,
    buttonText: 50,
    featureTitle: 100,
    featureDescription: 300,
    bulletPoint: 200,
    boxTitle: 150,
    boxDescription: 300,
  };

  // Track original data for each section to detect changes
  const [originalHeroSection, setOriginalHeroSection] = useState<any>(null);
  const [originalMissionSection, setOriginalMissionSection] = useState<any>(null);
  const [originalWhoWeAreSection, setOriginalWhoWeAreSection] = useState<any>(null);
  const [originalWhatWeDoSection, setOriginalWhatWeDoSection] = useState<any>(null);
  const [originalWhyFieldsySection, setOriginalWhyFieldsySection] = useState<any>(null);

  // Auto-save state for each section
  const [autoSaveStatus, setAutoSaveStatus] = useState<{
    hero?: 'idle' | 'saving' | 'saved' | 'error';
    mission?: 'idle' | 'saving' | 'saved' | 'error';
    whoWeAre?: 'idle' | 'saving' | 'saved' | 'error';
    whatWeDo?: 'idle' | 'saving' | 'saved' | 'error';
    whyFieldsy?: 'idle' | 'saving' | 'saved' | 'error';
  }>({});

  const autoSaveTimersRef = useRef<{
    hero?: NodeJS.Timeout;
    mission?: NodeJS.Timeout;
    whoWeAre?: NodeJS.Timeout;
    whatWeDo?: NodeJS.Timeout;
    whyFieldsy?: NodeJS.Timeout;
  }>({});

  // Initialize original data when aboutData changes
  useEffect(() => {
    if (aboutData) {
      setOriginalHeroSection(JSON.parse(JSON.stringify(aboutData.heroSection || {})));
      setOriginalMissionSection(JSON.parse(JSON.stringify(aboutData.missionSection || {})));
      setOriginalWhoWeAreSection(JSON.parse(JSON.stringify(aboutData.whoWeAreSection || {})));
      setOriginalWhatWeDoSection(JSON.parse(JSON.stringify(aboutData.whatWeDoSection || {})));
      setOriginalWhyFieldsySection(JSON.parse(JSON.stringify(aboutData.whyFieldsySection || {})));
    }
  }, [aboutData]);

  // Check if data has changed for each section
  const hasHeroSectionChanged = () => {
    return JSON.stringify(aboutHeroSection) !== JSON.stringify(originalHeroSection);
  };

  const hasMissionSectionChanged = () => {
    return JSON.stringify(aboutMissionSection) !== JSON.stringify(originalMissionSection);
  };

  const hasWhoWeAreSectionChanged = () => {
    return JSON.stringify(aboutWhoWeAreSection) !== JSON.stringify(originalWhoWeAreSection);
  };

  const hasWhatWeDoSectionChanged = () => {
    return JSON.stringify(aboutWhatWeDoSection) !== JSON.stringify(originalWhatWeDoSection);
  };

  const hasWhyFieldsySectionChanged = () => {
    return JSON.stringify(aboutWhyFieldsySection) !== JSON.stringify(originalWhyFieldsySection);
  };

  // Auto-save effect for hero section
  useEffect(() => {
    if (!hasHeroSectionChanged() || !originalHeroSection) return;

    if (autoSaveTimersRef.current.hero) clearTimeout(autoSaveTimersRef.current.hero);
    setAutoSaveStatus(prev => ({ ...prev, hero: 'saving' }));

    autoSaveTimersRef.current.hero = setTimeout(async () => {
      try {
        await updateAboutSection.mutateAsync({
          section: 'heroSection',
          updates: aboutHeroSection
        });
        setOriginalHeroSection(JSON.parse(JSON.stringify(aboutHeroSection)));
        setAutoSaveStatus(prev => ({ ...prev, hero: 'saved' }));
        setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, hero: 'idle' })), 2000);
      } catch (error) {
        console.error('Auto-save failed for hero section:', error);
        setAutoSaveStatus(prev => ({ ...prev, hero: 'error' }));
        setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, hero: 'idle' })), 3000);
      }
    }, 1500);

    return () => {
      if (autoSaveTimersRef.current.hero) clearTimeout(autoSaveTimersRef.current.hero);
    };
  }, [aboutHeroSection, originalHeroSection, updateAboutSection]);

  // Auto-save effect for mission section
  useEffect(() => {
    if (!hasMissionSectionChanged() || !originalMissionSection) return;

    if (autoSaveTimersRef.current.mission) clearTimeout(autoSaveTimersRef.current.mission);
    setAutoSaveStatus(prev => ({ ...prev, mission: 'saving' }));

    autoSaveTimersRef.current.mission = setTimeout(async () => {
      try {
        await updateAboutSection.mutateAsync({
          section: 'missionSection',
          updates: aboutMissionSection
        });
        setOriginalMissionSection(JSON.parse(JSON.stringify(aboutMissionSection)));
        setAutoSaveStatus(prev => ({ ...prev, mission: 'saved' }));
        setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, mission: 'idle' })), 2000);
      } catch (error) {
        console.error('Auto-save failed for mission section:', error);
        setAutoSaveStatus(prev => ({ ...prev, mission: 'error' }));
        setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, mission: 'idle' })), 3000);
      }
    }, 1500);

    return () => {
      if (autoSaveTimersRef.current.mission) clearTimeout(autoSaveTimersRef.current.mission);
    };
  }, [aboutMissionSection, originalMissionSection, updateAboutSection]);

  // Auto-save effect for whoWeAre section
  useEffect(() => {
    if (!hasWhoWeAreSectionChanged() || !originalWhoWeAreSection) return;

    if (autoSaveTimersRef.current.whoWeAre) clearTimeout(autoSaveTimersRef.current.whoWeAre);
    setAutoSaveStatus(prev => ({ ...prev, whoWeAre: 'saving' }));

    autoSaveTimersRef.current.whoWeAre = setTimeout(async () => {
      try {
        await updateAboutSection.mutateAsync({
          section: 'whoWeAreSection',
          updates: aboutWhoWeAreSection
        });
        setOriginalWhoWeAreSection(JSON.parse(JSON.stringify(aboutWhoWeAreSection)));
        setAutoSaveStatus(prev => ({ ...prev, whoWeAre: 'saved' }));
        setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, whoWeAre: 'idle' })), 2000);
      } catch (error) {
        console.error('Auto-save failed for whoWeAre section:', error);
        setAutoSaveStatus(prev => ({ ...prev, whoWeAre: 'error' }));
        setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, whoWeAre: 'idle' })), 3000);
      }
    }, 1500);

    return () => {
      if (autoSaveTimersRef.current.whoWeAre) clearTimeout(autoSaveTimersRef.current.whoWeAre);
    };
  }, [aboutWhoWeAreSection, originalWhoWeAreSection, updateAboutSection]);

  // Auto-save effect for whatWeDo section
  useEffect(() => {
    if (!hasWhatWeDoSectionChanged() || !originalWhatWeDoSection) return;

    if (autoSaveTimersRef.current.whatWeDo) clearTimeout(autoSaveTimersRef.current.whatWeDo);
    setAutoSaveStatus(prev => ({ ...prev, whatWeDo: 'saving' }));

    autoSaveTimersRef.current.whatWeDo = setTimeout(async () => {
      try {
        await updateAboutSection.mutateAsync({
          section: 'whatWeDoSection',
          updates: aboutWhatWeDoSection
        });
        setOriginalWhatWeDoSection(JSON.parse(JSON.stringify(aboutWhatWeDoSection)));
        setAutoSaveStatus(prev => ({ ...prev, whatWeDo: 'saved' }));
        setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, whatWeDo: 'idle' })), 2000);
      } catch (error) {
        console.error('Auto-save failed for whatWeDo section:', error);
        setAutoSaveStatus(prev => ({ ...prev, whatWeDo: 'error' }));
        setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, whatWeDo: 'idle' })), 3000);
      }
    }, 1500);

    return () => {
      if (autoSaveTimersRef.current.whatWeDo) clearTimeout(autoSaveTimersRef.current.whatWeDo);
    };
  }, [aboutWhatWeDoSection, originalWhatWeDoSection, updateAboutSection]);

  // Auto-save effect for whyFieldsy section
  useEffect(() => {
    if (!hasWhyFieldsySectionChanged() || !originalWhyFieldsySection) return;

    if (autoSaveTimersRef.current.whyFieldsy) clearTimeout(autoSaveTimersRef.current.whyFieldsy);
    setAutoSaveStatus(prev => ({ ...prev, whyFieldsy: 'saving' }));

    autoSaveTimersRef.current.whyFieldsy = setTimeout(async () => {
      try {
        await updateAboutSection.mutateAsync({
          section: 'whyFieldsySection',
          updates: aboutWhyFieldsySection
        });
        setOriginalWhyFieldsySection(JSON.parse(JSON.stringify(aboutWhyFieldsySection)));
        setAutoSaveStatus(prev => ({ ...prev, whyFieldsy: 'saved' }));
        setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, whyFieldsy: 'idle' })), 2000);
      } catch (error) {
        console.error('Auto-save failed for whyFieldsy section:', error);
        setAutoSaveStatus(prev => ({ ...prev, whyFieldsy: 'error' }));
        setTimeout(() => setAutoSaveStatus(prev => ({ ...prev, whyFieldsy: 'idle' })), 3000);
      }
    }, 1500);

    return () => {
      if (autoSaveTimersRef.current.whyFieldsy) clearTimeout(autoSaveTimersRef.current.whyFieldsy);
    };
  }, [aboutWhyFieldsySection, originalWhyFieldsySection, updateAboutSection]);

  const handleSaveSection = async (section: string, data: any, successMessage: string, errorMessage: string) => {
    const toastId = toast.loading('Saving changes...');

    try {
      await updateAboutSection.mutateAsync({
        section,
        updates: data
      });

      // Update the original data to match the saved data
      switch(section) {
        case 'heroSection':
          setOriginalHeroSection(JSON.parse(JSON.stringify(data)));
          break;
        case 'missionSection':
          setOriginalMissionSection(JSON.parse(JSON.stringify(data)));
          break;
        case 'whoWeAreSection':
          setOriginalWhoWeAreSection(JSON.parse(JSON.stringify(data)));
          break;
        case 'whatWeDoSection':
          setOriginalWhatWeDoSection(JSON.parse(JSON.stringify(data)));
          break;
        case 'whyFieldsySection':
          setOriginalWhyFieldsySection(JSON.parse(JSON.stringify(data)));
          break;
      }

      // Show success toast
      toast.success(successMessage, { id: toastId });

      // Also update the inline notification for consistency
      setNotification({ type: 'success', message: successMessage });
      setTimeout(() => setNotification(null), 5000);

    } catch (error: any) {
      // Show error toast with detailed message
      const errorMsg = error?.response?.data?.error ||
                      error?.response?.data?.message ||
                      error?.message ||
                      errorMessage;

      toast.error(errorMsg, { id: toastId });

      // Also update the inline notification
      setNotification({ type: 'error', message: errorMsg });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">About Us Page Management</h2>
      <p className="text-gray-600 mb-6">Manage the content for the About page</p>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">All in One Platform</TabsTrigger>
          <TabsTrigger value="mission">Our Mission</TabsTrigger>
          <TabsTrigger value="who">Who We Are</TabsTrigger>
          <TabsTrigger value="what">What We Do</TabsTrigger>
          <TabsTrigger value="why">Why Fieldsy</TabsTrigger>
        </TabsList>

        {/* Hero Section Tab */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All in One Platform Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="sectionTitle">
                    Section Title
                    <span className="text-xs text-gray-500 ml-2">
                      ({aboutHeroSection.sectionTitle?.length || 0}/{CHAR_LIMITS.sectionTitle})
                    </span>
                  </Label>
                  <Input
                    id="sectionTitle"
                    value={aboutHeroSection.sectionTitle}
                    onChange={(e) => setAboutHeroSection({ ...aboutHeroSection, sectionTitle: e.target.value })}
                    maxLength={CHAR_LIMITS.sectionTitle}
                    placeholder="e.g., About Us"
                  />
                </div>

                <div>
                  <Label htmlFor="mainTitle">
                    Main Title
                    <span className="text-xs text-gray-500 ml-2">
                      ({aboutHeroSection.mainTitle?.length || 0}/{CHAR_LIMITS.mainTitle})
                    </span>
                  </Label>
                  <Input
                    id="mainTitle"
                    value={aboutHeroSection.mainTitle}
                    onChange={(e) => setAboutHeroSection({ ...aboutHeroSection, mainTitle: e.target.value })}
                    maxLength={CHAR_LIMITS.mainTitle}
                    placeholder="Main heading for the hero section"
                  />
                </div>

                <div>
                  <Label htmlFor="description">
                    Description
                    <span className="text-xs text-gray-500 ml-2">
                      ({aboutHeroSection.description?.length || 0}/{CHAR_LIMITS.description})
                    </span>
                  </Label>
                  <textarea
                    id="description"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    value={aboutHeroSection.description}
                    onChange={(e) => setAboutHeroSection({ ...aboutHeroSection, description: e.target.value })}
                    maxLength={CHAR_LIMITS.description}
                    placeholder="Description text"
                  />
                </div>

                <SettingsImageUploader
                  label="Hero Image"
                  description="Main image for the hero section"
                  value={aboutHeroSection.image}
                  onChange={(url) => setAboutHeroSection({ ...aboutHeroSection, image: url as string })}
                  aspectRatio="video"
                />

                {/* Stats Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Statistics</Label>
                    <Button
                      type="button"
                      onClick={() => setAboutHeroSection({
                        ...aboutHeroSection,
                        stats: [...aboutHeroSection.stats, { value: '', label: '', order: aboutHeroSection.stats.length + 1 }]
                      })}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Stat
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {aboutHeroSection.stats.map((stat: any, index: number) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = [...aboutHeroSection.stats];
                              newStats[index] = { ...newStats[index], value: e.target.value };
                              setAboutHeroSection({ ...aboutHeroSection, stats: newStats });
                            }}
                            maxLength={CHAR_LIMITS.statValue}
                            placeholder="Value (e.g., 500+)"
                            className="w-24 px-2"
                          />
                          <p className="text-xs text-gray-500 ml-1 mt-0.5">{stat.value?.length || 0}/{CHAR_LIMITS.statValue}</p>
                        </div>
                        <div className="flex-2">
                          <Input
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...aboutHeroSection.stats];
                              newStats[index] = { ...newStats[index], label: e.target.value };
                              setAboutHeroSection({ ...aboutHeroSection, stats: newStats });
                            }}
                            maxLength={CHAR_LIMITS.statLabel}
                            placeholder="Label (e.g., Happy Customers)"
                          />
                          <p className="text-xs text-gray-500 ml-1 mt-0.5">{stat.label?.length || 0}/{CHAR_LIMITS.statLabel}</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const newStats = aboutHeroSection.stats.filter((_: any, i: number) => i !== index);
                            setAboutHeroSection({ ...aboutHeroSection, stats: newStats });
                          }}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Auto-save Status Indicator */}
                  <div className="text-sm font-medium flex items-center gap-2">
                    {autoSaveStatus.hero === 'saving' && (
                      <>
                        <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-blue-600">Auto-saving...</span>
                      </>
                    )}
                    {autoSaveStatus.hero === 'saved' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Auto-saved</span>
                      </>
                    )}
                    {autoSaveStatus.hero === 'error' && (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Save failed</span>
                      </>
                    )}
                    {hasHeroSectionChanged() && !autoSaveStatus.hero && (
                      <>
                        <div className="w-2 h-2 bg-yellow rounded-full animate-pulse"></div>
                        <span className="text-yellow-600">Will save automatically</span>
                      </>
                    )}
                  </div>

                  {/* Manual Save Fallback Button */}
                  {(hasHeroSectionChanged() || autoSaveStatus.hero === 'error') && (
                    <Button
                      onClick={() => handleSaveSection('heroSection', aboutHeroSection, 'Hero section updated successfully', 'Failed to update hero section')}
                      disabled={updateAboutSection.isPending}
                      className={`${
                        updateAboutSection.isPending
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green text-white hover:bg-green-700'
                      }`}
                      size="sm"
                      title="Save immediately (changes auto-save after 1.5 seconds)"
                    >
                      {updateAboutSection.isPending ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          <span>Save Now</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mission Section Tab */}
        <TabsContent value="mission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mission Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="missionTitle">
                    Title
                    <span className="text-xs text-gray-500 ml-2">
                      ({aboutMissionSection.title?.length || 0}/{CHAR_LIMITS.title})
                    </span>
                  </Label>
                  <Input
                    id="missionTitle"
                    value={aboutMissionSection.title}
                    onChange={(e) => setAboutMissionSection({ ...aboutMissionSection, title: e.target.value })}
                    maxLength={CHAR_LIMITS.title}
                    placeholder="Mission section title"
                  />
                </div>

                <div>
                  <Label htmlFor="missionDescription">
                    Description
                    <span className="text-xs text-gray-500 ml-2">
                      ({aboutMissionSection.description?.length || 0}/{CHAR_LIMITS.description})
                    </span>
                  </Label>
                  <textarea
                    id="missionDescription"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    value={aboutMissionSection.description}
                    onChange={(e) => setAboutMissionSection({ ...aboutMissionSection, description: e.target.value })}
                    maxLength={CHAR_LIMITS.description}
                    placeholder="Mission description"
                  />
                </div>

                <div>
                  <Label htmlFor="missionButton">
                    Button Text
                    <span className="text-xs text-gray-500 ml-2">
                      ({aboutMissionSection.buttonText?.length || 0}/{CHAR_LIMITS.buttonText})
                    </span>
                  </Label>
                  <Input
                    id="missionButton"
                    value={aboutMissionSection.buttonText}
                    onChange={(e) => setAboutMissionSection({ ...aboutMissionSection, buttonText: e.target.value })}
                    maxLength={CHAR_LIMITS.buttonText}
                    placeholder="Optional button text"
                  />
                </div>

                <div className="flex items-center gap-3">
                  {/* Auto-save Status Indicator */}
                  <div className="text-sm font-medium flex items-center gap-2">
                    {autoSaveStatus.mission === 'saving' && (
                      <>
                        <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-blue-600">Auto-saving...</span>
                      </>
                    )}
                    {autoSaveStatus.mission === 'saved' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Auto-saved</span>
                      </>
                    )}
                    {autoSaveStatus.mission === 'error' && (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Save failed</span>
                      </>
                    )}
                    {hasMissionSectionChanged() && !autoSaveStatus.mission && (
                      <>
                        <div className="w-2 h-2 bg-yellow rounded-full animate-pulse"></div>
                        <span className="text-yellow-600">Will save automatically</span>
                      </>
                    )}
                  </div>

                  {/* Manual Save Fallback Button */}
                  {(hasMissionSectionChanged() || autoSaveStatus.mission === 'error') && (
                    <Button
                      onClick={() => handleSaveSection('missionSection', aboutMissionSection, 'Mission section updated successfully', 'Failed to update mission section')}
                      disabled={updateAboutSection.isPending}
                      className={`${
                        updateAboutSection.isPending
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green text-white hover:bg-green-700'
                      }`}
                      size="sm"
                      title="Save immediately (changes auto-save after 1.5 seconds)"
                    >
                      {updateAboutSection.isPending ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          <span>Save Now</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Who We Are Section */}
        <TabsContent value="who" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Who We Are Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* Left Card Content */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Left Card Content</h3>

                  <div>
                    <Label htmlFor="whoTitle">
                      Title
                      <span className="text-xs text-gray-500 ml-2">
                        ({aboutWhoWeAreSection.title?.length || 0}/{CHAR_LIMITS.title})
                      </span>
                    </Label>
                    <Input
                      id="whoTitle"
                      value={aboutWhoWeAreSection.title}
                      onChange={(e) => setAboutWhoWeAreSection({ ...aboutWhoWeAreSection, title: e.target.value })}
                      maxLength={CHAR_LIMITS.title}
                      placeholder="e.g., Who We Are"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whoDescription">
                      Description
                      <span className="text-xs text-gray-500 ml-2">
                        ({aboutWhoWeAreSection.description?.length || 0}/{CHAR_LIMITS.description})
                      </span>
                    </Label>
                    <textarea
                      id="whoDescription"
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      value={aboutWhoWeAreSection.description}
                      onChange={(e) => setAboutWhoWeAreSection({ ...aboutWhoWeAreSection, description: e.target.value })}
                      maxLength={CHAR_LIMITS.description}
                      placeholder="Main description text"
                    />
                  </div>

                </div>

                {/* Middle Image */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Middle Image</h3>

                  <SettingsImageUploader
                    label="Main Center Image"
                    description="Large image displayed in the center (40% width)"
                    value={aboutWhoWeAreSection.mainImage}
                    onChange={(url) => setAboutWhoWeAreSection({ ...aboutWhoWeAreSection, mainImage: url as string })}
                    aspectRatio="video"
                  />
                </div>

                {/* Right Card Content */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Right Card Content</h3>

                  <SettingsImageUploader
                    label="Right Card Image"
                    description="Image displayed at top of right card"
                    value={aboutWhoWeAreSection.rightCardImage}
                    onChange={(url) => setAboutWhoWeAreSection({ ...aboutWhoWeAreSection, rightCardImage: url as string })}
                    aspectRatio="video"
                  />

                  <div>
                    <Label htmlFor="rightTitle">
                      Right Card Title
                      <span className="text-xs text-gray-500 ml-2">
                        ({aboutWhoWeAreSection.rightCardTitle?.length || 0}/{CHAR_LIMITS.title})
                      </span>
                    </Label>
                    <Input
                      id="rightTitle"
                      value={aboutWhoWeAreSection.rightCardTitle}
                      onChange={(e) => setAboutWhoWeAreSection({ ...aboutWhoWeAreSection, rightCardTitle: e.target.value })}
                      maxLength={CHAR_LIMITS.title}
                      placeholder="e.g., Loved by Paws and People Alike"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rightDescription">
                      Right Card Description
                      <span className="text-xs text-gray-500 ml-2">
                        ({aboutWhoWeAreSection.rightCardDescription?.length || 0}/{CHAR_LIMITS.description})
                      </span>
                    </Label>
                    <textarea
                      id="rightDescription"
                      className="w-full p-2 border rounded-md min-h-[80px]"
                      value={aboutWhoWeAreSection.rightCardDescription}
                      onChange={(e) => setAboutWhoWeAreSection({ ...aboutWhoWeAreSection, rightCardDescription: e.target.value })}
                      maxLength={CHAR_LIMITS.description}
                      placeholder="Description for right card"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Auto-save Status Indicator */}
                  <div className="text-sm font-medium flex items-center gap-2">
                    {autoSaveStatus.whoWeAre === 'saving' && (
                      <>
                        <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-blue-600">Auto-saving...</span>
                      </>
                    )}
                    {autoSaveStatus.whoWeAre === 'saved' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Auto-saved</span>
                      </>
                    )}
                    {autoSaveStatus.whoWeAre === 'error' && (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Save failed</span>
                      </>
                    )}
                    {hasWhoWeAreSectionChanged() && !autoSaveStatus.whoWeAre && (
                      <>
                        <div className="w-2 h-2 bg-yellow rounded-full animate-pulse"></div>
                        <span className="text-yellow-600">Will save automatically</span>
                      </>
                    )}
                  </div>

                  {/* Manual Save Fallback Button */}
                  {(hasWhoWeAreSectionChanged() || autoSaveStatus.whoWeAre === 'error') && (
                    <Button
                      onClick={() => handleSaveSection('whoWeAreSection', aboutWhoWeAreSection, 'Who We Are section updated successfully', 'Failed to update Who We Are section')}
                      disabled={updateAboutSection.isPending}
                      className={`${
                        updateAboutSection.isPending
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green text-white hover:bg-green-700'
                      }`}
                      size="sm"
                      title="Save immediately (changes auto-save after 1.5 seconds)"
                    >
                      {updateAboutSection.isPending ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          <span>Save Now</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* What We Do Section */}
        <TabsContent value="what" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>What We Do Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="whatTitle">
                    Title
                    <span className="text-xs text-gray-500 ml-2">
                      ({aboutWhatWeDoSection.title?.length || 0}/{CHAR_LIMITS.title})
                    </span>
                  </Label>
                  <Input
                    id="whatTitle"
                    value={aboutWhatWeDoSection.title}
                    onChange={(e) => setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, title: e.target.value })}
                    maxLength={CHAR_LIMITS.title}
                    placeholder="Section title"
                  />
                </div>

                <div>
                  <Label htmlFor="whatSubtitle">
                    Subtitle
                    <span className="text-xs text-gray-500 ml-2">
                      ({aboutWhatWeDoSection.subtitle?.length || 0}/{CHAR_LIMITS.subtitle})
                    </span>
                  </Label>
                  <Input
                    id="whatSubtitle"
                    value={aboutWhatWeDoSection.subtitle}
                    onChange={(e) => setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, subtitle: e.target.value })}
                    maxLength={CHAR_LIMITS.subtitle}
                    placeholder="Optional subtitle"
                  />
                </div>

                <div>
                  <Label htmlFor="whatDescription">
                    Description
                    <span className="text-xs text-gray-500 ml-2">
                      ({aboutWhatWeDoSection.description?.length || 0}/{CHAR_LIMITS.description})
                    </span>
                  </Label>
                  <textarea
                    id="whatDescription"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    value={aboutWhatWeDoSection.description}
                    onChange={(e) => setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, description: e.target.value })}
                    maxLength={CHAR_LIMITS.description}
                    placeholder="Section description"
                  />
                </div>

                {/* Features Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Features</Label>
                    <Button
                      type="button"
                      onClick={() => setAboutWhatWeDoSection({
                        ...aboutWhatWeDoSection,
                        features: [...aboutWhatWeDoSection.features, { title: '', description: '', order: aboutWhatWeDoSection.features.length + 1 }]
                      })}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Feature
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {aboutWhatWeDoSection.features.map((feature: any, index: number) => (
                      <div key={index} className="border p-3 rounded-lg space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              value={feature.title}
                              onChange={(e) => {
                                const newFeatures = [...aboutWhatWeDoSection.features];
                                newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                                setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, features: newFeatures });
                              }}
                              maxLength={CHAR_LIMITS.featureTitle}
                              placeholder="Feature title"
                            />
                            <p className="text-xs text-gray-500 ml-1 mt-0.5">{feature.title?.length || 0}/{CHAR_LIMITS.featureTitle}</p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              const newFeatures = aboutWhatWeDoSection.features.filter((_: any, i: number) => i !== index);
                              setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, features: newFeatures });
                            }}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <textarea
                            className="w-full p-2 border rounded-md min-h-[60px]"
                            value={feature.description}
                            onChange={(e) => {
                              const newFeatures = [...aboutWhatWeDoSection.features];
                              newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                              setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, features: newFeatures });
                            }}
                            maxLength={CHAR_LIMITS.featureDescription}
                            placeholder="Feature description"
                          />
                          <p className="text-xs text-gray-500 ml-1 mt-0.5">{feature.description?.length || 0}/{CHAR_LIMITS.featureDescription}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Auto-save Status Indicator */}
                  <div className="text-sm font-medium flex items-center gap-2">
                    {autoSaveStatus.whatWeDo === 'saving' && (
                      <>
                        <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-blue-600">Auto-saving...</span>
                      </>
                    )}
                    {autoSaveStatus.whatWeDo === 'saved' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Auto-saved</span>
                      </>
                    )}
                    {autoSaveStatus.whatWeDo === 'error' && (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Save failed</span>
                      </>
                    )}
                    {hasWhatWeDoSectionChanged() && !autoSaveStatus.whatWeDo && (
                      <>
                        <div className="w-2 h-2 bg-yellow rounded-full animate-pulse"></div>
                        <span className="text-yellow-600">Will save automatically</span>
                      </>
                    )}
                  </div>

                  {/* Manual Save Fallback Button */}
                  {(hasWhatWeDoSectionChanged() || autoSaveStatus.whatWeDo === 'error') && (
                    <Button
                      onClick={() => handleSaveSection('whatWeDoSection', aboutWhatWeDoSection, 'What We Do section updated successfully', 'Failed to update What We Do section')}
                      disabled={updateAboutSection.isPending}
                      className={`${
                        updateAboutSection.isPending
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green text-white hover:bg-green-700'
                      }`}
                      size="sm"
                      title="Save immediately (changes auto-save after 1.5 seconds)"
                    >
                      {updateAboutSection.isPending ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          <span>Save Now</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Why Fieldsy Section */}
        <TabsContent value="why" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Why Fieldsy Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {/* Left Image */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Left Side Image</h3>

                  <SettingsImageUploader
                    label="Section Image"
                    description="Image displayed on the left side"
                    value={aboutWhyFieldsySection.image}
                    onChange={(url) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, image: url as string })}
                    aspectRatio="video"
                  />
                </div>

                {/* Right Content */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Right Side Content</h3>

                  <div>
                    <Label htmlFor="whyTitle">
                      Main Title
                      <span className="text-xs text-gray-500 ml-2">
                        ({aboutWhyFieldsySection.title?.length || 0}/{CHAR_LIMITS.title})
                      </span>
                    </Label>
                    <Input
                      id="whyTitle"
                      value={aboutWhyFieldsySection.title}
                      onChange={(e) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, title: e.target.value })}
                      maxLength={CHAR_LIMITS.title}
                      placeholder="e.g., Why Fieldsy?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whySubtitle">
                      Subtitle/Description
                      <span className="text-xs text-gray-500 ml-2">
                        ({aboutWhyFieldsySection.subtitle?.length || 0}/{CHAR_LIMITS.subtitle})
                      </span>
                    </Label>
                    <textarea
                      id="whySubtitle"
                      className="w-full p-2 border rounded-md min-h-[80px]"
                      value={aboutWhyFieldsySection.subtitle}
                      onChange={(e) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, subtitle: e.target.value })}
                      maxLength={CHAR_LIMITS.subtitle}
                      placeholder="e.g., Choosing Fieldsy means choosing peace of mind..."
                    />
                  </div>

                  {/* Bullet Points */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Bullet Points</Label>
                      <Button
                        type="button"
                        onClick={() => setAboutWhyFieldsySection({
                          ...aboutWhyFieldsySection,
                          features: [...aboutWhyFieldsySection.features, { icon: '', title: '', description: '', order: aboutWhyFieldsySection.features.length + 1 }]
                        })}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Bullet Point
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {aboutWhyFieldsySection.features.map((feature: any, index: number) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1">
                            <Input
                              value={feature.description}
                              onChange={(e) => {
                                const newFeatures = [...aboutWhyFieldsySection.features];
                                newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                                setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, features: newFeatures });
                              }}
                              maxLength={CHAR_LIMITS.bulletPoint}
                              placeholder="Bullet point text"
                            />
                            <p className="text-xs text-gray-500 ml-1 mt-0.5">{feature.description?.length || 0}/{CHAR_LIMITS.bulletPoint}</p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              const newFeatures = aboutWhyFieldsySection.features.filter((_: any, i: number) => i !== index);
                              setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, features: newFeatures });
                            }}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlighted Box Section */}
                  <div className="space-y-4 p-3 border-l-4 border-l-green rounded bg-white">
                    <Label>Highlighted Box Content</Label>

                    <div>
                      <Label htmlFor="boxTitle">
                        Box Title
                        <span className="text-xs text-gray-500 ml-2">
                          ({aboutWhyFieldsySection.boxTitle?.length || 0}/{CHAR_LIMITS.boxTitle})
                        </span>
                      </Label>
                      <Input
                        id="boxTitle"
                        value={aboutWhyFieldsySection.boxTitle}
                        onChange={(e) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, boxTitle: e.target.value })}
                        maxLength={CHAR_LIMITS.boxTitle}
                        placeholder="e.g., Let's Build the Future of Field Intelligence"
                      />
                    </div>

                    <div>
                      <Label htmlFor="boxDescription">
                        Box Description
                        <span className="text-xs text-gray-500 ml-2">
                          ({aboutWhyFieldsySection.boxDescription?.length || 0}/{CHAR_LIMITS.boxDescription})
                        </span>
                      </Label>
                      <textarea
                        id="boxDescription"
                        className="w-full p-2 border rounded-md min-h-[80px]"
                        value={aboutWhyFieldsySection.boxDescription}
                        onChange={(e) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, boxDescription: e.target.value })}
                        maxLength={CHAR_LIMITS.boxDescription}
                        placeholder="Description for the highlighted box"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="buttonText">
                      Button Text
                      <span className="text-xs text-gray-500 ml-2">
                        ({aboutWhyFieldsySection.buttonText?.length || 0}/{CHAR_LIMITS.buttonText})
                      </span>
                    </Label>
                    <Input
                      id="buttonText"
                      value={aboutWhyFieldsySection.buttonText}
                      onChange={(e) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, buttonText: e.target.value })}
                      maxLength={CHAR_LIMITS.buttonText}
                      placeholder="e.g., Download App"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Auto-save Status Indicator */}
                  <div className="text-sm font-medium flex items-center gap-2">
                    {autoSaveStatus.whyFieldsy === 'saving' && (
                      <>
                        <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-blue-600">Auto-saving...</span>
                      </>
                    )}
                    {autoSaveStatus.whyFieldsy === 'saved' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Auto-saved</span>
                      </>
                    )}
                    {autoSaveStatus.whyFieldsy === 'error' && (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Save failed</span>
                      </>
                    )}
                    {hasWhyFieldsySectionChanged() && !autoSaveStatus.whyFieldsy && (
                      <>
                        <div className="w-2 h-2 bg-yellow rounded-full animate-pulse"></div>
                        <span className="text-yellow-600">Will save automatically</span>
                      </>
                    )}
                  </div>

                  {/* Manual Save Fallback Button */}
                  {(hasWhyFieldsySectionChanged() || autoSaveStatus.whyFieldsy === 'error') && (
                    <Button
                      onClick={() => handleSaveSection('whyFieldsySection', aboutWhyFieldsySection, 'Why Fieldsy section updated successfully', 'Failed to update Why Fieldsy section')}
                      disabled={updateAboutSection.isPending}
                      className={`${
                        updateAboutSection.isPending
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green text-white hover:bg-green-700'
                      }`}
                      size="sm"
                      title="Save immediately (changes auto-save after 1.5 seconds)"
                    >
                      {updateAboutSection.isPending ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          <span>Save Now</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
