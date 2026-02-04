import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  Type,
  Box,
  Sparkles,
  Layers,
  Search,
  Home,
  User,
  Settings,
  Bell,
  Mail,
  Calendar,
  Clock,
  Check,
  X,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Edit,
  Trash,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Heart,
  Star,
  Share,
  Copy,
  Filter,
  MoreVertical,
  Menu,
  Grid,
  List,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// Common icons for the icons section
const commonIcons = [
  { name: 'Home', icon: Home, category: 'Navigation' },
  { name: 'User', icon: User, category: 'User' },
  { name: 'Settings', icon: Settings, category: 'System' },
  { name: 'Bell', icon: Bell, category: 'Notifications' },
  { name: 'Mail', icon: Mail, category: 'Communication' },
  { name: 'Calendar', icon: Calendar, category: 'Time' },
  { name: 'Clock', icon: Clock, category: 'Time' },
  { name: 'Check', icon: Check, category: 'Status' },
  { name: 'X', icon: X, category: 'Status' },
  { name: 'AlertCircle', icon: AlertCircle, category: 'Alerts' },
  { name: 'Info', icon: Info, category: 'Alerts' },
  { name: 'ChevronRight', icon: ChevronRight, category: 'Navigation' },
  { name: 'ChevronLeft', icon: ChevronLeft, category: 'Navigation' },
  { name: 'ChevronDown', icon: ChevronDown, category: 'Navigation' },
  { name: 'ChevronUp', icon: ChevronUp, category: 'Navigation' },
  { name: 'Plus', icon: Plus, category: 'Actions' },
  { name: 'Minus', icon: Minus, category: 'Actions' },
  { name: 'Edit', icon: Edit, category: 'Actions' },
  { name: 'Trash', icon: Trash, category: 'Actions' },
  { name: 'Save', icon: Save, category: 'Actions' },
  { name: 'Download', icon: Download, category: 'Actions' },
  { name: 'Upload', icon: Upload, category: 'Actions' },
  { name: 'Eye', icon: Eye, category: 'Visibility' },
  { name: 'EyeOff', icon: EyeOff, category: 'Visibility' },
  { name: 'Lock', icon: Lock, category: 'Security' },
  { name: 'Unlock', icon: Unlock, category: 'Security' },
  { name: 'Heart', icon: Heart, category: 'Social' },
  { name: 'Star', icon: Star, category: 'Social' },
  { name: 'Share', icon: Share, category: 'Social' },
  { name: 'Copy', icon: Copy, category: 'Actions' },
  { name: 'Filter', icon: Filter, category: 'Data' },
  { name: 'MoreVertical', icon: MoreVertical, category: 'System' },
  { name: 'Menu', icon: Menu, category: 'Navigation' },
  { name: 'Grid', icon: Grid, category: 'Layout' },
  { name: 'List', icon: List, category: 'Layout' },
  { name: 'ArrowRight', icon: ArrowRight, category: 'Navigation' },
  { name: 'ArrowLeft', icon: ArrowLeft, category: 'Navigation' },
  { name: 'ArrowUp', icon: ArrowUp, category: 'Navigation' },
  { name: 'ArrowDown', icon: ArrowDown, category: 'Navigation' },
];

export default function UIKit() {
  const [iconSearch, setIconSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(commonIcons.map(icon => icon.category)))];

  const filteredIcons = commonIcons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(iconSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Color tokens from CSS variables
  const colorTokens = [
    { name: 'Primary', var: '--primary', value: 'hsl(24 72% 24%)', description: 'Main brand color' },
    { name: 'Primary Foreground', var: '--primary-foreground', value: 'hsl(0 0% 100%)', description: 'Text on primary' },
    { name: 'Secondary', var: '--secondary', value: 'hsl(0 0% 96%)', description: 'Secondary background' },
    { name: 'Secondary Foreground', var: '--secondary-foreground', value: 'hsl(0 0% 9%)', description: 'Text on secondary' },
    { name: 'Destructive', var: '--destructive', value: 'hsl(0 84% 60%)', description: 'Error/danger color' },
    { name: 'Destructive Foreground', var: '--destructive-foreground', value: 'hsl(0 0% 100%)', description: 'Text on destructive' },
    { name: 'Success', var: '--success', value: 'hsl(142 71% 45%)', description: 'Success color' },
    { name: 'Success Foreground', var: '--success-foreground', value: 'hsl(0 0% 100%)', description: 'Text on success' },
    { name: 'Warning', var: '--warning', value: 'hsl(38 92% 50%)', description: 'Warning color' },
    { name: 'Warning Foreground', var: '--warning-foreground', value: 'hsl(0 0% 9%)', description: 'Text on warning' },
    { name: 'Muted', var: '--muted', value: 'hsl(0 0% 96%)', description: 'Muted background' },
    { name: 'Muted Foreground', var: '--muted-foreground', value: 'hsl(0 0% 45%)', description: 'Muted text' },
    { name: 'Accent', var: '--accent', value: 'hsl(0 0% 97%)', description: 'Accent background' },
    { name: 'Accent Foreground', var: '--accent-foreground', value: 'hsl(0 0% 9%)', description: 'Text on accent' },
    { name: 'Background', var: '--background', value: 'hsl(0 0% 100%)', description: 'Page background' },
    { name: 'Foreground', var: '--foreground', value: 'hsl(0 0% 9%)', description: 'Primary text' },
    { name: 'Border', var: '--border', value: 'hsl(0 0% 89%)', description: 'Border color' },
    { name: 'Input', var: '--input', value: 'hsl(0 0% 89%)', description: 'Input border' },
    { name: 'Ring', var: '--ring', value: 'hsl(24 72% 24%)', description: 'Focus ring' },
  ];

  const shadowVariants = [
    { name: 'Soft', class: 'shadow-soft', description: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.08)' },
    { name: 'Medium', class: 'shadow-medium', description: '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 8px 24px -4px rgba(0, 0, 0, 0.12)' },
    { name: 'Elevated', class: 'shadow-elevated', description: '0 8px 24px -4px rgba(0, 0, 0, 0.1), 0 16px 48px -8px rgba(0, 0, 0, 0.15)' },
    { name: 'Primary/10', class: 'shadow-primary/10', description: 'Shadow with primary color at 10% opacity' },
    { name: 'Primary/20', class: 'shadow-primary/20', description: 'Shadow with primary color at 20% opacity' },
    { name: 'Default', class: 'shadow-sm', description: 'Small shadow' },
    { name: 'Default', class: 'shadow', description: 'Default shadow' },
    { name: 'Large', class: 'shadow-lg', description: 'Large shadow' },
  ];

  const borderRadiusVariants = [
    { name: 'Small', class: 'rounded-sm', value: 'calc(var(--radius) - 4px)' },
    { name: 'Medium', class: 'rounded-md', value: 'calc(var(--radius) - 2px)' },
    { name: 'Large', class: 'rounded-lg', value: 'var(--radius)' },
    { name: 'Extra Large', class: 'rounded-xl', value: 'calc(var(--radius) + 4px)' },
    { name: '2XL', class: 'rounded-2xl', value: 'calc(var(--radius) + 8px)' },
  ];

  const spacingScale = [
    { name: '0', class: 'p-0', value: '0px' },
    { name: '1', class: 'p-1', value: '0.25rem (4px)' },
    { name: '2', class: 'p-2', value: '0.5rem (8px)' },
    { name: '3', class: 'p-3', value: '0.75rem (12px)' },
    { name: '4', class: 'p-4', value: '1rem (16px)' },
    { name: '6', class: 'p-6', value: '1.5rem (24px)' },
    { name: '8', class: 'p-8', value: '2rem (32px)' },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="page-title">UI Kit</h1>
          <p className="text-muted-foreground">
            Complete design system reference for developers. Use this guide to maintain consistency across the application.
          </p>
        </div>

        <Tabs defaultValue="typography" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="typography">
              <Type className="w-4 h-4 mr-2" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="w-4 h-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="shadows">
              <Sparkles className="w-4 h-4 mr-2" />
              Shadows
            </TabsTrigger>
            <TabsTrigger value="icons">
              <Box className="w-4 h-4 mr-2" />
              Icons
            </TabsTrigger>
            <TabsTrigger value="tokens">
              <Layers className="w-4 h-4 mr-2" />
              Tokens
            </TabsTrigger>
          </TabsList>

          {/* Typography Section */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Typography Scale</CardTitle>
                <CardDescription>Text styles and font weights used throughout the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Font Family */}
                <div>
                  <h3 className="subsection-header mb-4">Font Family</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-lg font-medium mb-2">Inter</p>
                    <code className="text-sm text-muted-foreground">font-family: 'Inter', system-ui, -apple-system, sans-serif</code>
                  </div>
                </div>

                {/* Text Styles */}
                <div>
                  <h3 className="subsection-header mb-4">Text Styles</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h1 className="page-title mb-2">Page Title</h1>
                      <code className="text-xs text-muted-foreground">className="page-title"</code>
                      <p className="text-xs text-muted-foreground mt-2">Font size: clamp(28px, 4vw, 36px) | Weight: 700 | Line height: 1.2</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h2 className="section-header mb-2">Section Header</h2>
                      <code className="text-xs text-muted-foreground">className="section-header"</code>
                      <p className="text-xs text-muted-foreground mt-2">Font size: clamp(18px, 3vw, 24px) | Weight: 600 | Line height: 1.3</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="subsection-header mb-2">Subsection Header</h3>
                      <code className="text-xs text-muted-foreground">className="subsection-header"</code>
                      <p className="text-xs text-muted-foreground mt-2">Font size: 16px | Weight: 600 | Line height: 1.4</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <p className="body-text mb-2">Body Text - This is the standard body text used throughout the application.</p>
                      <code className="text-xs text-muted-foreground">className="body-text"</code>
                      <p className="text-xs text-muted-foreground mt-2">Font size: 14px | Weight: 400 | Line height: 1.5</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <p className="small-text mb-2">Small Text - Used for secondary information and captions.</p>
                      <code className="text-xs text-muted-foreground">className="small-text"</code>
                      <p className="text-xs text-muted-foreground mt-2">Font size: 12px | Weight: 400 | Line height: 1.4</p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <p className="helper-text mb-2">Helper Text - Used for form labels and hints.</p>
                      <code className="text-xs text-muted-foreground">className="helper-text"</code>
                      <p className="text-xs text-muted-foreground mt-2">Font size: 12px | Weight: 500 | Line height: 1.4</p>
                    </div>
                  </div>
                </div>

                {/* Font Weights */}
                <div>
                  <h3 className="subsection-header mb-4">Font Weights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[400, 500, 600, 700, 800, 900].map((weight) => (
                      <div key={weight} className="p-4 border rounded-lg">
                        <p className="text-lg" style={{ fontWeight: weight }}>
                          Weight {weight}
                        </p>
                        <code className="text-xs text-muted-foreground">font-weight: {weight}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Section */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>All color tokens from the design system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colorTokens.map((color) => (
                    <div key={color.var} className="border rounded-lg overflow-hidden">
                      <div
                        className="h-24 w-full"
                        style={{ backgroundColor: `hsl(var(${color.var}))` }}
                      />
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{color.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {color.var}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{color.description}</p>
                        <code className="text-xs block bg-muted p-2 rounded">
                          {color.value}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shadows Section */}
          <TabsContent value="shadows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shadows</CardTitle>
                <CardDescription>Shadow variants for elevation and depth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shadowVariants.map((shadow) => (
                    <div key={shadow.class} className="space-y-3">
                      <div
                        className={`h-32 w-full bg-card border rounded-lg flex items-center justify-center ${shadow.class}`}
                      >
                        <span className="text-sm text-muted-foreground">Preview</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{shadow.name}</h4>
                        <code className="text-xs block bg-muted p-2 rounded mb-2">
                          {shadow.class}
                        </code>
                        <p className="text-xs text-muted-foreground">{shadow.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Icons Section */}
          <TabsContent value="icons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Icons</CardTitle>
                <CardDescription>Commonly used icons from lucide-react library</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search icons..."
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Badge
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Icon Sizes */}
                <div>
                  <h3 className="subsection-header mb-4">Icon Sizes</h3>
                  <div className="flex items-center gap-6 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      <span className="text-sm">Small (w-4 h-4)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      <span className="text-sm">Medium (w-5 h-5)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-6 h-6" />
                      <span className="text-sm">Large (w-6 h-6)</span>
                    </div>
                  </div>
                </div>

                {/* Icon Grid */}
                <div>
                  <h3 className="subsection-header mb-4">Icon Library</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                    {filteredIcons.map(({ name, icon: Icon, category }) => (
                      <div
                        key={name}
                        className="flex flex-col items-center p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer group"
                      >
                        <Icon className="w-6 h-6 mb-2 text-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs text-center text-muted-foreground">{name}</span>
                        <code className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {category}
                        </code>
                      </div>
                    ))}
                  </div>
                  {filteredIcons.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No icons found matching your search.
                    </div>
                  )}
                </div>

                {/* Usage Example */}
                <div>
                  <h3 className="subsection-header mb-4">Usage Example</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <code className="text-sm block mb-2">import {'{ Home }'} from 'lucide-react';</code>
                    <code className="text-sm block">&lt;Home className="w-5 h-5" /&gt;</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Tokens Section */}
          <TabsContent value="tokens" className="space-y-6">
            {/* Border Radius */}
            <Card>
              <CardHeader>
                <CardTitle>Border Radius</CardTitle>
                <CardDescription>Border radius variants for rounded corners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {borderRadiusVariants.map((radius) => (
                    <div key={radius.class} className="space-y-3">
                      <div
                        className={`h-24 w-full bg-primary/10 border-2 border-primary flex items-center justify-center ${radius.class}`}
                      >
                        <span className="text-xs text-primary font-medium">{radius.name}</span>
                      </div>
                      <div>
                        <code className="text-xs block bg-muted p-2 rounded mb-1">
                          {radius.class}
                        </code>
                        <p className="text-xs text-muted-foreground">{radius.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spacing Scale */}
            <Card>
              <CardHeader>
                <CardTitle>Spacing Scale</CardTitle>
                <CardDescription>Consistent spacing values used throughout the application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {spacingScale.map((spacing) => (
                    <div key={spacing.name} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-20 text-sm font-medium">{spacing.name}</div>
                      <div className="flex-1">
                        <div className="bg-primary/20 rounded" style={{ width: spacing.value.includes('px') ? spacing.value : '100%', height: '24px' }} />
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{spacing.class}</code>
                      <span className="text-xs text-muted-foreground w-32 text-right">{spacing.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Transitions */}
            <Card>
              <CardHeader>
                <CardTitle>Transitions & Animations</CardTitle>
                <CardDescription>Animation utilities for smooth interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Transition Classes</h4>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg">
                        <code className="text-sm">transition-smooth</code>
                        <p className="text-xs text-muted-foreground mt-1">transition-all duration-200 ease-out</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <code className="text-sm">focus-ring</code>
                        <p className="text-xs text-muted-foreground mt-1">Focus visible ring styles</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Animations</h4>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg">
                        <code className="text-sm">animate-fade-in</code>
                        <p className="text-xs text-muted-foreground mt-1">Fade in animation</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <code className="text-sm">animate-scale-in</code>
                        <p className="text-xs text-muted-foreground mt-1">Scale in animation</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <code className="text-sm">animate-shimmer</code>
                        <p className="text-xs text-muted-foreground mt-1">Shimmer loading effect</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Glass Effect */}
            <Card>
              <CardHeader>
                <CardTitle>Glass Effect</CardTitle>
                <CardDescription>Glass morphism utility class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 bg-gradient-to-br from-amber-50/30 via-yellow-50/20 to-orange-50/30 rounded-lg">
                  <div className="glass p-6 rounded-lg border">
                    <h4 className="font-semibold mb-2">Glass Effect Example</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This card uses the glass utility class for a backdrop blur effect.
                    </p>
                    <code className="text-xs bg-muted p-2 rounded block">className="glass"</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
