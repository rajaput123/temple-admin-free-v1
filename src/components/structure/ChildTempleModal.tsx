import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChildTemple, Temple, StructureStatus } from '@/types/temple-structure';
import { CustomFieldsEditor } from './CustomFieldsEditor';
import { X } from 'lucide-react';

interface ChildTempleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childTemple?: ChildTemple | null;
  temples: Temple[];
  onSave: (childTemple: Partial<ChildTemple>) => void;
}

export function ChildTempleModal({
  open,
  onOpenChange,
  childTemple,
  temples,
  onSave
}: ChildTempleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    parentTempleId: '',
    description: '',
    status: 'active' as StructureStatus,
    operationalSettings: { independent: false, followParent: true },
    distanceFromMain: 0,
    sharedFacilities: [] as Array<{ facilityType: string; accessLevel: string }>,
    customFields: {} as Record<string, string>,
  });
  const [facilityType, setFacilityType] = useState('');
  const [accessLevel, setAccessLevel] = useState('full');

  useEffect(() => {
    if (childTemple) {
      setFormData({
        name: childTemple.name,
        parentTempleId: childTemple.parentTempleId,
        description: childTemple.description,
        status: childTemple.status,
        operationalSettings: childTemple.operationalSettings || { independent: false, followParent: true },
        distanceFromMain: childTemple.distanceFromMain || 0,
        sharedFacilities: childTemple.sharedFacilities || [],
        customFields: childTemple.customFields || {},
      });
    } else {
      setFormData({
        name: '',
        parentTempleId: temples[0]?.id || '',
        description: '',
        status: 'active',
        operationalSettings: { independent: false, followParent: true },
        distanceFromMain: 0,
        sharedFacilities: [],
        customFields: {},
      });
    }
  }, [childTemple, temples, open]);

  const handleAddNewTemple = async (name: string) => {
    const newTemple: Temple = {
      id: `temple-${Date.now()}`,
      name,
      location: '',
      description: '',
      status: 'active',
      isPrimary: false,
      createdAt: new Date().toISOString(),
    };
    temples.push(newTemple);
    return { value: newTemple.id, label: newTemple.name };
  };

  const handleAddFacility = () => {
    if (facilityType.trim()) {
      setFormData({
        ...formData,
        sharedFacilities: [...formData.sharedFacilities, { facilityType: facilityType.trim(), accessLevel }]
      });
      setFacilityType('');
      setAccessLevel('full');
    }
  };

  const handleRemoveFacility = (index: number) => {
    setFormData({
      ...formData,
      sharedFacilities: formData.sharedFacilities.filter((_, i) => i !== index)
    });
  };

  const templeOptions = temples.map(t => ({ value: t.id, label: t.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...childTemple,
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{childTemple ? 'Edit Child Temple' : 'Add Child Temple'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full justify-start flex-wrap">
              <TabsTrigger value="basic" className="text-sm">Basic</TabsTrigger>
              <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
              <TabsTrigger value="facilities" className="text-sm">Facilities</TabsTrigger>
              <TabsTrigger value="custom" className="text-sm">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name" className="text-sm">Child Temple Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter child temple name"
                    required
                    className="h-9"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="parentTemple" className="text-sm">Parent Temple *</Label>
                  <SearchableSelect
                    options={templeOptions}
                    value={formData.parentTempleId}
                    onChange={(value) => setFormData({ ...formData, parentTempleId: value })}
                    placeholder="Select parent temple"
                    addNewLabel="+ Add New Temple"
                    onAddNew={handleAddNewTemple}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Status</Label>
                  <Switch
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, status: checked ? 'active' : 'inactive' })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Operational Independence</Label>
                  <p className="text-xs text-muted-foreground">
                    Operates independently from parent temple
                  </p>
                </div>
                <Switch
                  checked={formData.operationalSettings.independent}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      operationalSettings: {
                        ...formData.operationalSettings,
                        independent: checked,
                        followParent: !checked
                      }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Follow Parent Temple Settings</Label>
                  <p className="text-xs text-muted-foreground">
                    Use same timings and policies as parent
                  </p>
                </div>
                <Switch
                  checked={formData.operationalSettings.followParent}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      operationalSettings: {
                        ...formData.operationalSettings,
                        followParent: checked,
                        independent: !checked
                      }
                    })
                  }
                  disabled={formData.operationalSettings.independent}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance">Distance from Main Temple (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.01"
                  value={formData.distanceFromMain}
                  onChange={(e) => setFormData({ ...formData, distanceFromMain: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-calculated if GPS coordinates available
                </p>
              </div>
            </TabsContent>

            <TabsContent value="facilities" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Shared Facilities</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Facilities shared with parent or main temple
                </p>

                <div className="flex gap-2">
                  <Input
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    placeholder="Facility name (e.g., Parking, Kitchen)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFacility();
                      }
                    }}
                  />
                  <Select value={accessLevel} onValueChange={setAccessLevel}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={handleAddFacility}>
                    Add
                  </Button>
                </div>

                {formData.sharedFacilities.length > 0 && (
                  <div className="border rounded-lg p-3 space-y-2 mt-2">
                    {formData.sharedFacilities.map((facility, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted rounded px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{facility.facilityType}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground capitalize">{facility.accessLevel} Access</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFacility(index)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <CustomFieldsEditor
                customFields={formData.customFields}
                onChange={(fields) => setFormData({ ...formData, customFields: fields })}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {childTemple ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
