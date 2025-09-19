import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SettingsImageUploader } from '@/components/ui/SettingsImageUploader';

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
  
  // Track original data for each section to detect changes
  const [originalHeroSection, setOriginalHeroSection] = useState<any>(null);
  const [originalMissionSection, setOriginalMissionSection] = useState<any>(null);
  const [originalWhoWeAreSection, setOriginalWhoWeAreSection] = useState<any>(null);
  const [originalWhatWeDoSection, setOriginalWhatWeDoSection] = useState<any>(null);
  const [originalWhyFieldsySection, setOriginalWhyFieldsySection] = useState<any>(null);
  
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
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="mission">Mission</TabsTrigger>
          <TabsTrigger value="who">Who We Are</TabsTrigger>
          <TabsTrigger value="what">What We Do</TabsTrigger>
          <TabsTrigger value="why">Why Fieldsy</TabsTrigger>
        </TabsList>

        {/* Hero Section Tab */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="sectionTitle">Section Title</Label>
                  <Input
                    id="sectionTitle"
                    value={aboutHeroSection.sectionTitle}
                    onChange={(e) => setAboutHeroSection({ ...aboutHeroSection, sectionTitle: e.target.value })}
                    placeholder="e.g., About Us"
                  />
                </div>

                <div>
                  <Label htmlFor="mainTitle">Main Title</Label>
                  <Input
                    id="mainTitle"
                    value={aboutHeroSection.mainTitle}
                    onChange={(e) => setAboutHeroSection({ ...aboutHeroSection, mainTitle: e.target.value })}
                    placeholder="Main heading for the hero section"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    value={aboutHeroSection.description}
                    onChange={(e) => setAboutHeroSection({ ...aboutHeroSection, description: e.target.value })}
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
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...aboutHeroSection.stats];
                            newStats[index] = { ...newStats[index], value: e.target.value };
                            setAboutHeroSection({ ...aboutHeroSection, stats: newStats });
                          }}
                          placeholder="Value (e.g., 500+)"
                          className="flex-1 w-24 px-2"
                        />
                        <Input
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...aboutHeroSection.stats];
                            newStats[index] = { ...newStats[index], label: e.target.value };
                            setAboutHeroSection({ ...aboutHeroSection, stats: newStats });
                          }}
                          placeholder="Label (e.g., Happy Customers)"
                          className="flex-2"
                        />
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

                <Button
                  onClick={() => handleSaveSection('heroSection', aboutHeroSection, 'Hero section updated successfully', 'Failed to update hero section')}
                  disabled={updateAboutSection.isPending || !hasHeroSectionChanged()}
                  className={`w-full sm:w-auto ${
                    !hasHeroSectionChanged() || updateAboutSection.isPending
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green text-white hover:bg-green-700'
                  }`}
                >
                  {updateAboutSection.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className={`w-4 h-4 mr-2 ${hasHeroSectionChanged() ? 'text-white' : 'text-gray-500'}`} />
                  )}
                  <span className={hasHeroSectionChanged() ? 'text-white' : 'text-gray-500'}>
                    Save Hero Section
                  </span> 
                </Button>
                
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
                  <Label htmlFor="missionTitle">Title</Label>
                  <Input
                    id="missionTitle"
                    value={aboutMissionSection.title}
                    onChange={(e) => setAboutMissionSection({ ...aboutMissionSection, title: e.target.value })}
                    placeholder="Mission section title"
                  />
                </div>

                <div>
                  <Label htmlFor="missionDescription">Description</Label>
                  <textarea
                    id="missionDescription"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    value={aboutMissionSection.description}
                    onChange={(e) => setAboutMissionSection({ ...aboutMissionSection, description: e.target.value })}
                    placeholder="Mission description"
                  />
                </div>

                <div>
                  <Label htmlFor="missionButton">Button Text</Label>
                  <Input
                    id="missionButton"
                    value={aboutMissionSection.buttonText}
                    onChange={(e) => setAboutMissionSection({ ...aboutMissionSection, buttonText: e.target.value })}
                    placeholder="Optional button text"
                  />
                </div>

                <Button
                  onClick={() => handleSaveSection('missionSection', aboutMissionSection, 'Mission section updated successfully', 'Failed to update mission section')}
                  disabled={updateAboutSection.isPending || !hasMissionSectionChanged()}
                  className={`w-full sm:w-auto ${
                    !hasMissionSectionChanged() || updateAboutSection.isPending
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green text-white hover:bg-green-700'
                  }`}
                >
                  {updateAboutSection.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className={`w-4 h-4 mr-2 ${hasMissionSectionChanged() ? 'text-white' : 'text-gray-500'}`} />
                  )}
                  <span className={hasMissionSectionChanged() ? 'text-white' : 'text-gray-500'}>
                    Save Mission Section
                  </span>
                </Button>
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
                    <Label htmlFor="whoTitle">Title</Label>
                    <Input
                      id="whoTitle"
                      value={aboutWhoWeAreSection.title}
                      onChange={(e) => setAboutWhoWeAreSection({ ...aboutWhoWeAreSection, title: e.target.value })}
                      placeholder="e.g., Who We Are"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whoDescription">Description</Label>
                    <textarea
                      id="whoDescription"
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      value={aboutWhoWeAreSection.description}
                      onChange={(e) => setAboutWhoWeAreSection({ ...aboutWhoWeAreSection, description: e.target.value })}
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
                    <Label htmlFor="rightTitle">Right Card Title</Label>
                    <Input
                      id="rightTitle"
                      value={aboutWhoWeAreSection.rightCardTitle}
                      onChange={(e) => setAboutWhoWeAreSection({ ...aboutWhoWeAreSection, rightCardTitle: e.target.value })}
                      placeholder="e.g., Loved by Paws and People Alike"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rightDescription">Right Card Description</Label>
                    <textarea
                      id="rightDescription"
                      className="w-full p-2 border rounded-md min-h-[80px]"
                      value={aboutWhoWeAreSection.rightCardDescription}
                      onChange={(e) => setAboutWhoWeAreSection({ ...aboutWhoWeAreSection, rightCardDescription: e.target.value })}
                      placeholder="Description for right card"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveSection('whoWeAreSection', aboutWhoWeAreSection, 'Who We Are section updated successfully', 'Failed to update Who We Are section')}
                  disabled={updateAboutSection.isPending || !hasWhoWeAreSectionChanged()}
                  className={`w-full sm:w-auto ${
                    !hasWhoWeAreSectionChanged() || updateAboutSection.isPending
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green text-white hover:bg-green-700'
                  }`}
                >
                  {updateAboutSection.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className={`w-4 h-4 mr-2 ${hasWhoWeAreSectionChanged() ? 'text-white' : 'text-gray-500'}`} />
                  )}
                  <span className={hasWhoWeAreSectionChanged() ? 'text-white' : 'text-gray-500'}>
                    Save Who We Are Section
                  </span>
                </Button>
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
                  <Label htmlFor="whatTitle">Title</Label>
                  <Input
                    id="whatTitle"
                    value={aboutWhatWeDoSection.title}
                    onChange={(e) => setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, title: e.target.value })}
                    placeholder="Section title"
                  />
                </div>

                <div>
                  <Label htmlFor="whatSubtitle">Subtitle</Label>
                  <Input
                    id="whatSubtitle"
                    value={aboutWhatWeDoSection.subtitle}
                    onChange={(e) => setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, subtitle: e.target.value })}
                    placeholder="Optional subtitle"
                  />
                </div>

                <div>
                  <Label htmlFor="whatDescription">Description</Label>
                  <textarea
                    id="whatDescription"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                    value={aboutWhatWeDoSection.description}
                    onChange={(e) => setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, description: e.target.value })}
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
                          <Input
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...aboutWhatWeDoSection.features];
                              newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                              setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, features: newFeatures });
                            }}
                            placeholder="Feature title"
                            className="flex-1"
                          />
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
                        <textarea
                          className="w-full p-2 border rounded-md min-h-[60px]"
                          value={feature.description}
                          onChange={(e) => {
                            const newFeatures = [...aboutWhatWeDoSection.features];
                            newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                            setAboutWhatWeDoSection({ ...aboutWhatWeDoSection, features: newFeatures });
                          }}
                          placeholder="Feature description"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveSection('whatWeDoSection', aboutWhatWeDoSection, 'What We Do section updated successfully', 'Failed to update What We Do section')}
                  disabled={updateAboutSection.isPending || !hasWhatWeDoSectionChanged()}
                  className={`w-full sm:w-auto ${
                    !hasWhatWeDoSectionChanged() || updateAboutSection.isPending
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green text-white hover:bg-green-700'
                  }`}
                >
                  {updateAboutSection.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className={`w-4 h-4 mr-2 ${hasWhatWeDoSectionChanged() ? 'text-white' : 'text-gray-500'}`} />
                  )}
                  <span className={hasWhatWeDoSectionChanged() ? 'text-white' : 'text-gray-500'}>
                    Save What We Do Section
                  </span>
                </Button>
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
                    <Label htmlFor="whyTitle">Main Title</Label>
                    <Input
                      id="whyTitle"
                      value={aboutWhyFieldsySection.title}
                      onChange={(e) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, title: e.target.value })}
                      placeholder="e.g., Why Fieldsy?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whySubtitle">Subtitle/Description</Label>
                    <textarea
                      id="whySubtitle"
                      className="w-full p-2 border rounded-md min-h-[80px]"
                      value={aboutWhyFieldsySection.subtitle}
                      onChange={(e) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, subtitle: e.target.value })}
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
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            value={feature.description}
                            onChange={(e) => {
                              const newFeatures = [...aboutWhyFieldsySection.features];
                              newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                              setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, features: newFeatures });
                            }}
                            placeholder="Bullet point text"
                            className="flex-1"
                          />
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
                      <Label htmlFor="boxTitle">Box Title</Label>
                      <Input
                        id="boxTitle"
                        value={aboutWhyFieldsySection.boxTitle}
                        onChange={(e) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, boxTitle: e.target.value })}
                        placeholder="e.g., Let's Build the Future of Field Intelligence"
                      />
                    </div>

                    <div>
                      <Label htmlFor="boxDescription">Box Description</Label>
                      <textarea
                        id="boxDescription"
                        className="w-full p-2 border rounded-md min-h-[80px]"
                        value={aboutWhyFieldsySection.boxDescription}
                        onChange={(e) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, boxDescription: e.target.value })}
                        placeholder="Description for the highlighted box"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={aboutWhyFieldsySection.buttonText}
                      onChange={(e) => setAboutWhyFieldsySection({ ...aboutWhyFieldsySection, buttonText: e.target.value })}
                      placeholder="e.g., Download App"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveSection('whyFieldsySection', aboutWhyFieldsySection, 'Why Fieldsy section updated successfully', 'Failed to update Why Fieldsy section')}
                  disabled={updateAboutSection.isPending || !hasWhyFieldsySectionChanged()}
                  className={`w-full sm:w-auto ${
                    !hasWhyFieldsySectionChanged() || updateAboutSection.isPending
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green text-white hover:bg-green-700'
                  }`}
                >
                  {updateAboutSection.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className={`w-4 h-4 mr-2 ${hasWhyFieldsySectionChanged() ? 'text-white' : 'text-gray-500'}`} />
                  )}
                  <span className={hasWhyFieldsySectionChanged() ? 'text-white' : 'text-gray-500'}>
                    Save Why Fieldsy Section
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}