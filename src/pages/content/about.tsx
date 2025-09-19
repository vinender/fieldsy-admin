import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/Layout/AdminLayout'
import { useAboutPage, useUpdateAboutSection } from '@/hooks/useAboutPage'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Loader2, Plus, Trash2, Save } from 'lucide-react'

export default function AboutPageManagement() {
  const { data: aboutData, isLoading } = useAboutPage();
  const updateSection = useUpdateAboutSection();
  
  const [heroSection, setHeroSection] = useState({
    sectionTitle: '',
    mainTitle: '',
    subtitle: '',
    description: '',
    buttonText: '',
    image: '',
    stats: [] as Array<{ value: string; label: string; order: number }>
  })

  const [missionSection, setMissionSection] = useState({
    title: '',
    description: '',
    buttonText: '',
    image: ''
  })

  const [whoWeAreSection, setWhoWeAreSection] = useState({
    title: '',
    description: '',
    features: [] as Array<{ icon: string; title: string; description: string; order: number }>
  })

  const [whatWeDoSection, setWhatWeDoSection] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    features: [] as Array<{ title: string; description: string; order: number }>
  })

  const [whyFieldsySection, setWhyFieldsySection] = useState({
    title: '',
    subtitle: '',
    features: [] as Array<{ icon: string; title: string; description: string; order: number }>
  })

  useEffect(() => {
    if (aboutData) {
      setHeroSection(aboutData.heroSection || {
        sectionTitle: '',
        mainTitle: '',
        subtitle: '',
        description: '',
        buttonText: '',
        image: '',
        stats: []
      })
      setMissionSection(aboutData.missionSection || {
        title: '',
        description: '',
        buttonText: '',
        image: ''
      })
      setWhoWeAreSection(aboutData.whoWeAreSection || {
        title: '',
        description: '',
        features: []
      })
      setWhatWeDoSection(aboutData.whatWeDoSection || {
        title: '',
        subtitle: '',
        description: '',
        image: '',
        features: []
      })
      setWhyFieldsySection(aboutData.whyFieldsySection || {
        title: '',
        subtitle: '',
        features: []
      })
    }
  }, [aboutData])

  const handleSaveHeroSection = async () => {
    try {
      await updateSection.mutateAsync({
        section: 'heroSection',
        updates: heroSection
      })
      toast.success('Hero section updated successfully')
    } catch (error) {
      toast.error('Failed to update hero section')
    }
  }

  const handleSaveMissionSection = async () => {
    try {
      await updateSection.mutateAsync({
        section: 'missionSection',
        updates: missionSection
      })
      toast.success('Mission section updated successfully')
    } catch (error) {
      toast.error('Failed to update mission section')
    }
  }

  const handleSaveWhoWeAreSection = async () => {
    try {
      await updateSection.mutateAsync({
        section: 'whoWeAreSection',
        updates: whoWeAreSection
      })
      toast.success('Who We Are section updated successfully')
    } catch (error) {
      toast.error('Failed to update Who We Are section')
    }
  }

  const handleSaveWhatWeDoSection = async () => {
    try {
      await updateSection.mutateAsync({
        section: 'whatWeDoSection',
        updates: whatWeDoSection
      })
      toast.success('What We Do section updated successfully')
    } catch (error) {
      toast.error('Failed to update What We Do section')
    }
  }

  const handleSaveWhyFieldsySection = async () => {
    try {
      await updateSection.mutateAsync({
        section: 'whyFieldsySection',
        updates: whyFieldsySection
      })
      toast.success('Why Fieldsy section updated successfully')
    } catch (error) {
      toast.error('Failed to update Why Fieldsy section')
    }
  }

  const addStat = () => {
    setHeroSection({
      ...heroSection,
      stats: [...heroSection.stats, { value: '', label: '', order: heroSection.stats.length + 1 }]
    })
  }

  const updateStat = (index: number, field: 'value' | 'label', value: string) => {
    const newStats = [...heroSection.stats]
    newStats[index] = { ...newStats[index], [field]: value }
    setHeroSection({ ...heroSection, stats: newStats })
  }

  const removeStat = (index: number) => {
    const newStats = heroSection.stats.filter((_, i) => i !== index)
    setHeroSection({ ...heroSection, stats: newStats })
  }

  // Who We Are Features
  const addWhoWeAreFeature = () => {
    setWhoWeAreSection({
      ...whoWeAreSection,
      features: [...whoWeAreSection.features, { icon: '', title: '', description: '', order: whoWeAreSection.features.length + 1 }]
    })
  }

  const updateWhoWeAreFeature = (index: number, field: keyof typeof whoWeAreSection.features[0], value: string) => {
    const newFeatures = [...whoWeAreSection.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setWhoWeAreSection({ ...whoWeAreSection, features: newFeatures })
  }

  const removeWhoWeAreFeature = (index: number) => {
    const newFeatures = whoWeAreSection.features.filter((_, i) => i !== index)
    setWhoWeAreSection({ ...whoWeAreSection, features: newFeatures })
  }

  // What We Do Features
  const addWhatWeDoFeature = () => {
    setWhatWeDoSection({
      ...whatWeDoSection,
      features: [...whatWeDoSection.features, { title: '', description: '', order: whatWeDoSection.features.length + 1 }]
    })
  }

  const updateWhatWeDoFeature = (index: number, field: keyof typeof whatWeDoSection.features[0], value: string) => {
    const newFeatures = [...whatWeDoSection.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setWhatWeDoSection({ ...whatWeDoSection, features: newFeatures })
  }

  const removeWhatWeDoFeature = (index: number) => {
    const newFeatures = whatWeDoSection.features.filter((_, i) => i !== index)
    setWhatWeDoSection({ ...whatWeDoSection, features: newFeatures })
  }

  // Why Fieldsy Features
  const addWhyFieldsyFeature = () => {
    setWhyFieldsySection({
      ...whyFieldsySection,
      features: [...whyFieldsySection.features, { icon: '', title: '', description: '', order: whyFieldsySection.features.length + 1 }]
    })
  }

  const updateWhyFieldsyFeature = (index: number, field: keyof typeof whyFieldsySection.features[0], value: string) => {
    const newFeatures = [...whyFieldsySection.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setWhyFieldsySection({ ...whyFieldsySection, features: newFeatures })
  }

  const removeWhyFieldsyFeature = (index: number) => {
    const newFeatures = whyFieldsySection.features.filter((_, i) => i !== index)
    setWhyFieldsySection({ ...whyFieldsySection, features: newFeatures })
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">About Page Management</h1>
          <p className="text-gray-600 mt-2">Manage the content for the About page</p>
        </div>

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
                      value={heroSection.sectionTitle}
                      onChange={(e) => setHeroSection({ ...heroSection, sectionTitle: e.target.value })}
                      placeholder="e.g., About Us"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mainTitle">Main Title</Label>
                    <Input
                      id="mainTitle"
                      value={heroSection.mainTitle}
                      onChange={(e) => setHeroSection({ ...heroSection, mainTitle: e.target.value })}
                      placeholder="Main heading for the hero section"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      value={heroSection.description}
                      onChange={(e) => setHeroSection({ ...heroSection, description: e.target.value })}
                      placeholder="Description text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={heroSection.image}
                      onChange={(e) => setHeroSection({ ...heroSection, image: e.target.value })}
                      placeholder="/about/image.png"
                    />
                  </div>

                  {/* Stats Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Statistics</Label>
                      <Button
                        type="button"
                        onClick={addStat}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Stat
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {heroSection.stats.map((stat, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            value={stat.value}
                            onChange={(e) => updateStat(index, 'value', e.target.value)}
                            placeholder="Value (e.g., 500+)"
                            className="flex-1"
                          />
                          <Input
                            value={stat.label}
                            onChange={(e) => updateStat(index, 'label', e.target.value)}
                            placeholder="Label (e.g., Happy Customers)"
                            className="flex-2"
                          />
                          <Button
                            type="button"
                            onClick={() => removeStat(index)}
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
                    onClick={handleSaveHeroSection}
                    disabled={updateSection.isPending}
                    className="w-full sm:w-auto"
                  >
                    {updateSection.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Hero Section
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
                      value={missionSection.title}
                      onChange={(e) => setMissionSection({ ...missionSection, title: e.target.value })}
                      placeholder="Mission section title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="missionDescription">Description</Label>
                    <textarea
                      id="missionDescription"
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      value={missionSection.description}
                      onChange={(e) => setMissionSection({ ...missionSection, description: e.target.value })}
                      placeholder="Mission description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="missionButton">Button Text</Label>
                    <Input
                      id="missionButton"
                      value={missionSection.buttonText}
                      onChange={(e) => setMissionSection({ ...missionSection, buttonText: e.target.value })}
                      placeholder="Optional button text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="missionImage">Image URL</Label>
                    <Input
                      id="missionImage"
                      value={missionSection.image}
                      onChange={(e) => setMissionSection({ ...missionSection, image: e.target.value })}
                      placeholder="/about/mission-image.png"
                    />
                  </div>

                  <Button
                    onClick={handleSaveMissionSection}
                    disabled={updateSection.isPending}
                    className="w-full sm:w-auto"
                  >
                    {updateSection.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Mission Section
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
                  <div>
                    <Label htmlFor="whoTitle">Title</Label>
                    <Input
                      id="whoTitle"
                      value={whoWeAreSection.title}
                      onChange={(e) => setWhoWeAreSection({ ...whoWeAreSection, title: e.target.value })}
                      placeholder="Section title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whoDescription">Description</Label>
                    <textarea
                      id="whoDescription"
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      value={whoWeAreSection.description}
                      onChange={(e) => setWhoWeAreSection({ ...whoWeAreSection, description: e.target.value })}
                      placeholder="Section description"
                    />
                  </div>

                  {/* Features Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Features</Label>
                      <Button
                        type="button"
                        onClick={addWhoWeAreFeature}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {whoWeAreSection.features.map((feature, index) => (
                        <div key={index} className="border p-3 rounded-lg space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={feature.icon}
                              onChange={(e) => updateWhoWeAreFeature(index, 'icon', e.target.value)}
                              placeholder="Icon name (e.g., Heart)"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() => removeWhoWeAreFeature(index)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input
                            value={feature.title}
                            onChange={(e) => updateWhoWeAreFeature(index, 'title', e.target.value)}
                            placeholder="Feature title"
                          />
                          <textarea
                            className="w-full p-2 border rounded-md min-h-[60px]"
                            value={feature.description}
                            onChange={(e) => updateWhoWeAreFeature(index, 'description', e.target.value)}
                            placeholder="Feature description"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveWhoWeAreSection}
                    disabled={updateSection.isPending}
                    className="w-full sm:w-auto"
                  >
                    {updateSection.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Who We Are Section
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
                      value={whatWeDoSection.title}
                      onChange={(e) => setWhatWeDoSection({ ...whatWeDoSection, title: e.target.value })}
                      placeholder="Section title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatSubtitle">Subtitle</Label>
                    <Input
                      id="whatSubtitle"
                      value={whatWeDoSection.subtitle}
                      onChange={(e) => setWhatWeDoSection({ ...whatWeDoSection, subtitle: e.target.value })}
                      placeholder="Optional subtitle"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatDescription">Description</Label>
                    <textarea
                      id="whatDescription"
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      value={whatWeDoSection.description}
                      onChange={(e) => setWhatWeDoSection({ ...whatWeDoSection, description: e.target.value })}
                      placeholder="Section description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatImage">Image URL</Label>
                    <Input
                      id="whatImage"
                      value={whatWeDoSection.image}
                      onChange={(e) => setWhatWeDoSection({ ...whatWeDoSection, image: e.target.value })}
                      placeholder="/about/what-we-do.png"
                    />
                  </div>

                  {/* Features Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Features</Label>
                      <Button
                        type="button"
                        onClick={addWhatWeDoFeature}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {whatWeDoSection.features.map((feature, index) => (
                        <div key={index} className="border p-3 rounded-lg space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={feature.title}
                              onChange={(e) => updateWhatWeDoFeature(index, 'title', e.target.value)}
                              placeholder="Feature title"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() => removeWhatWeDoFeature(index)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <textarea
                            className="w-full p-2 border rounded-md min-h-[60px]"
                            value={feature.description}
                            onChange={(e) => updateWhatWeDoFeature(index, 'description', e.target.value)}
                            placeholder="Feature description"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveWhatWeDoSection}
                    disabled={updateSection.isPending}
                    className="w-full sm:w-auto"
                  >
                    {updateSection.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save What We Do Section
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
                  <div>
                    <Label htmlFor="whyTitle">Title</Label>
                    <Input
                      id="whyTitle"
                      value={whyFieldsySection.title}
                      onChange={(e) => setWhyFieldsySection({ ...whyFieldsySection, title: e.target.value })}
                      placeholder="Section title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whySubtitle">Subtitle</Label>
                    <Input
                      id="whySubtitle"
                      value={whyFieldsySection.subtitle}
                      onChange={(e) => setWhyFieldsySection({ ...whyFieldsySection, subtitle: e.target.value })}
                      placeholder="Optional subtitle"
                    />
                  </div>

                  {/* Features Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Features</Label>
                      <Button
                        type="button"
                        onClick={addWhyFieldsyFeature}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {whyFieldsySection.features.map((feature, index) => (
                        <div key={index} className="border p-3 rounded-lg space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={feature.icon}
                              onChange={(e) => updateWhyFieldsyFeature(index, 'icon', e.target.value)}
                              placeholder="Icon name (e.g., CheckCircle)"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              onClick={() => removeWhyFieldsyFeature(index)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input
                            value={feature.title}
                            onChange={(e) => updateWhyFieldsyFeature(index, 'title', e.target.value)}
                            placeholder="Feature title"
                          />
                          <textarea
                            className="w-full p-2 border rounded-md min-h-[60px]"
                            value={feature.description}
                            onChange={(e) => updateWhyFieldsyFeature(index, 'description', e.target.value)}
                            placeholder="Feature description"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveWhyFieldsySection}
                    disabled={updateSection.isPending}
                    className="w-full sm:w-auto"
                  >
                    {updateSection.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Why Fieldsy Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}