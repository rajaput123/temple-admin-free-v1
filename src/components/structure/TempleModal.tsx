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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Temple, StructureStatus } from '@/types/temple-structure';
import { CustomFieldsEditor } from './CustomFieldsEditor';
import { X } from 'lucide-react';

interface TempleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  temple?: Temple | null;
  onSave: (temple: Partial<Temple>) => void;
  hasPrimaryTemple?: boolean;
}

export function TempleModal({ 
  open, 
  onOpenChange, 
  temple, 
  onSave,
  hasPrimaryTemple = false 
}: TempleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    status: 'active' as StructureStatus,
    isPrimary: false,
    deity: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    gpsCoordinates: { latitude: 0, longitude: 0 },
    geoFencingRadius: 0,
    operationalStatus: 'open' as 'open' | 'closed' | 'maintenance',
    darshanTimings: { open: '06:00', close: '20:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    facilities: [] as string[],
    dressCode: '',
    templeHistory: '',
    customFields: {} as Record<string, string>,
  });
  const [facilityInput, setFacilityInput] = useState('');

  useEffect(() => {
    if (temple) {
      setFormData({
        name: temple.name,
        location: temple.location,
        description: temple.description,
        status: temple.status,
        isPrimary: temple.isPrimary,
        deity: temple.deity || '',
        contactPhone: temple.contactPhone || '',
        contactEmail: temple.contactEmail || '',
        contactAddress: temple.contactAddress || '',
        gpsCoordinates: temple.gpsCoordinates || { latitude: 0, longitude: 0 },
        geoFencingRadius: temple.geoFencingRadius || 0,
        operationalStatus: temple.operationalStatus || 'open',
        darshanTimings: temple.darshanTimings || { open: '06:00', close: '20:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        facilities: temple.facilities || [],
        dressCode: temple.dressCode || '',
        templeHistory: temple.templeHistory || '',
        customFields: temple.customFields || {},
      });
    } else {
      setFormData({
        name: '',
        location: '',
        description: '',
        status: 'active',
        isPrimary: !hasPrimaryTemple,
        deity: '',
        contactPhone: '',
        contactEmail: '',
        contactAddress: '',
        gpsCoordinates: { latitude: 0, longitude: 0 },
        geoFencingRadius: 0,
        operationalStatus: 'open',
        darshanTimings: { open: '06:00', close: '20:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
        facilities: [],
        dressCode: '',
        templeHistory: '',
        customFields: {},
      });
    }
    setFacilityInput('');
  }, [temple, hasPrimaryTemple, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...temple,
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{temple ? 'Edit Temple' : 'Add Temple'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Temple Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter temple name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
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
                <div className="space-y-0.5">
                  <Label>Primary Temple</Label>
                  <p className="text-xs text-muted-foreground">
                    Only one primary temple per installation
                  </p>
                </div>
                <Switch
                  checked={formData.isPrimary}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked })}
                  disabled={hasPrimaryTemple && !temple?.isPrimary}
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
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deity">Deity</Label>
                  <Input
                    id="deity"
                    value={formData.deity}
                    onChange={(e) => setFormData({ ...formData, deity: e.target.value })}
                    placeholder="Deity name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operationalStatus">Operational Status</Label>
                  <select
                    id="operationalStatus"
                    value={formData.operationalStatus}
                    onChange={(e) => setFormData({ ...formData, operationalStatus: e.target.value as 'open' | 'closed' | 'maintenance' })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactAddress">Contact Address</Label>
                <Textarea
                  id="contactAddress"
                  value={formData.contactAddress}
                  onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.gpsCoordinates.latitude}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      gpsCoordinates: { ...formData.gpsCoordinates, latitude: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.gpsCoordinates.longitude}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      gpsCoordinates: { ...formData.gpsCoordinates, longitude: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="0.0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="geoFencingRadius">Geo-fencing Radius (meters)</Label>
                <Input
                  id="geoFencingRadius"
                  type="number"
                  value={formData.geoFencingRadius}
                  onChange={(e) => setFormData({ ...formData, geoFencingRadius: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="darshanOpen">Darshan Open Time</Label>
                  <Input
                    id="darshanOpen"
                    type="time"
                    value={formData.darshanTimings.open}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      darshanTimings: { ...formData.darshanTimings, open: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="darshanClose">Darshan Close Time</Label>
                  <Input
                    id="darshanClose"
                    type="time"
                    value={formData.darshanTimings.close}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      darshanTimings: { ...formData.darshanTimings, close: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facilities">Facilities</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="facilities"
                      value={facilityInput}
                      onChange={(e) => setFacilityInput(e.target.value)}
                      placeholder="Enter facility name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && facilityInput.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            facilities: [...formData.facilities, facilityInput.trim()]
                          });
                          setFacilityInput('');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (facilityInput.trim()) {
                          setFormData({
                            ...formData,
                            facilities: [...formData.facilities, facilityInput.trim()]
                          });
                          setFacilityInput('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {formData.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                        >
                          {facility}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                facilities: formData.facilities.filter((_, i) => i !== index)
                              });
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dressCode">Dress Code</Label>
                <Textarea
                  id="dressCode"
                  value={formData.dressCode}
                  onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                  placeholder="Enter dress code requirements"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="templeHistory">Temple History</Label>
                <Textarea
                  id="templeHistory"
                  value={formData.templeHistory}
                  onChange={(e) => setFormData({ ...formData, templeHistory: e.target.value })}
                  placeholder="Enter temple historical information"
                  rows={5}
                />
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
              {temple ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
