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
import { Sacred, Temple, ChildTemple, sacredTypeLabels, StructureStatus } from '@/types/temple-structure';
import { CustomFieldsEditor } from './CustomFieldsEditor';
import { X } from 'lucide-react';

interface SacredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sacred?: Sacred | null;
  temples: Temple[];
  childTemples: ChildTemple[];
  onSave: (sacred: Partial<Sacred>) => void;
}

export function SacredModal({
  open,
  onOpenChange,
  sacred,
  temples,
  childTemples,
  onSave
}: SacredModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sacredType: 'deity' as Sacred['sacredType'],
    associatedTempleId: '',
    associatedTempleType: 'temple' as Sacred['associatedTempleType'],
    description: '',
    status: 'active' as StructureStatus,
    // Samadhi fields
    jagadguruName: '',
    peetha: '',
    samadhiYear: undefined as number | undefined,
    // Details
    installationDate: '',
    sacredObjects: [] as Array<{ name: string; type: string; description: string }>,
    // Schedule
    festivals: [] as Array<{ name: string; date: string; description: string }>,
    abhishekamSchedule: [] as Array<{ day: string; time: string; type: string }>,
    // Eligibility
    eligiblePujas: [] as string[],
    eligibleSevas: [] as string[],
    darshanPriority: 'general' as 'vip' | 'general' | 'special',
    // Closure
    temporaryClosure: { isClosed: false, fromDate: '', toDate: '', reason: '' },
    customFields: {} as Record<string, string>,
  });

  // State for adding items
  const [festivalName, setFestivalName] = useState('');
  const [festivalDate, setFestivalDate] = useState('');
  const [festivalDesc, setFestivalDesc] = useState('');
  const [abhishekamDay, setAbhishekamDay] = useState('');
  const [abhishekamTime, setAbhishekamTime] = useState('');
  const [abhishekamType, setAbhishekamType] = useState('');
  const [pujaInput, setPujaInput] = useState('');
  const [sevaInput, setSevaInput] = useState('');

  useEffect(() => {
    if (sacred) {
      setFormData({
        name: sacred.name,
        sacredType: sacred.sacredType,
        associatedTempleId: sacred.associatedTempleId,
        associatedTempleType: sacred.associatedTempleType,
        description: sacred.description,
        status: sacred.status,
        jagadguruName: sacred.jagadguruName || '',
        peetha: sacred.peetha || '',
        samadhiYear: sacred.samadhiYear,
        installationDate: sacred.installationDate || '',
        sacredObjects: sacred.sacredObjects || [],
        festivals: sacred.festivals || [],
        abhishekamSchedule: sacred.abhishekamSchedule || [],
        eligiblePujas: sacred.eligiblePujas || [],
        eligibleSevas: sacred.eligibleSevas || [],
        darshanPriority: sacred.darshanPriority || 'general',
        temporaryClosure: sacred.temporaryClosure || { isClosed: false, fromDate: '', toDate: '', reason: '' },
        customFields: sacred.customFields || {},
      });
    } else {
      setFormData({
        name: '',
        sacredType: 'deity',
        associatedTempleId: temples[0]?.id || '',
        associatedTempleType: 'temple',
        description: '',
        status: 'active',
        jagadguruName: '',
        peetha: '',
        samadhiYear: undefined,
        installationDate: '',
        sacredObjects: [],
        festivals: [],
        abhishekamSchedule: [],
        eligiblePujas: [],
        eligibleSevas: [],
        darshanPriority: 'general',
        temporaryClosure: { isClosed: false, fromDate: '', toDate: '', reason: '' },
        customFields: {},
      });
    }
  }, [sacred, temples, open]);

  const allTempleOptions = [
    ...temples.map(t => ({ value: `temple:${t.id}`, label: t.name })),
    ...childTemples.map(t => ({ value: `child_temple:${t.id}`, label: `${t.name} (Sub-Temple)` })),
  ];

  const handleAddFestival = () => {
    if (festivalName.trim() && festivalDate) {
      setFormData({
        ...formData,
        festivals: [...formData.festivals, { name: festivalName.trim(), date: festivalDate, description: festivalDesc.trim() }]
      });
      setFestivalName('');
      setFestivalDate('');
      setFestivalDesc('');
    }
  };

  const handleAddAbhishekam = () => {
    if (abhishekamDay.trim() && abhishekamTime && abhishekamType.trim()) {
      setFormData({
        ...formData,
        abhishekamSchedule: [...formData.abhishekamSchedule, { day: abhishekamDay.trim(), time: abhishekamTime, type: abhishekamType.trim() }]
      });
      setAbhishekamDay('');
      setAbhishekamTime('');
      setAbhishekamType('');
    }
  };

  const handleAddPuja = () => {
    if (pujaInput.trim() && !formData.eligiblePujas.includes(pujaInput.trim())) {
      setFormData({ ...formData, eligiblePujas: [...formData.eligiblePujas, pujaInput.trim()] });
      setPujaInput('');
    }
  };

  const handleAddSeva = () => {
    if (sevaInput.trim() && !formData.eligibleSevas.includes(sevaInput.trim())) {
      setFormData({ ...formData, eligibleSevas: [...formData.eligibleSevas, sevaInput.trim()] });
      setSevaInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<Sacred> = {
      ...sacred,
      ...formData,
    };
    if (formData.sacredType !== 'samadhi') {
      delete data.jagadguruName;
      delete data.peetha;
      delete data.samadhiYear;
    }
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sacred ? 'Edit Sacred' : 'Add Sacred (Deity / Samadhi)'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              <TabsTrigger value="closure">Closure</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sacred Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter sacred name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sacredType">Sacred Type *</Label>
                <SearchableSelect
                  options={Object.entries(sacredTypeLabels).map(([value, label]) => ({ value, label }))}
                  value={formData.sacredType}
                  onChange={(value) => setFormData({ ...formData, sacredType: value as Sacred['sacredType'] })}
                  placeholder="Select type"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="associatedTemple">Associated Temple *</Label>
                <SearchableSelect
                  options={allTempleOptions}
                  value={`${formData.associatedTempleType}:${formData.associatedTempleId}`}
                  onChange={(value) => {
                    const [type, id] = value.split(':');
                    setFormData({
                      ...formData,
                      associatedTempleType: type as Sacred['associatedTempleType'],
                      associatedTempleId: id
                    });
                  }}
                  placeholder="Select temple"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={2}
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
              <div className="space-y-2">
                <Label htmlFor="installationDate">Installation Date</Label>
                <Input
                  id="installationDate"
                  type="date"
                  value={formData.installationDate}
                  onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                />
              </div>

              {formData.sacredType === 'samadhi' && (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                  <h4 className="text-sm font-semibold">Samadhi Specific Details</h4>
                  <div className="space-y-2">
                    <Label htmlFor="jagad guruName">Jagadguru / Peethadhipati Name</Label>
                    <Input
                      id="jagadguruName"
                      value={formData.jagadguruName}
                      onChange={(e) => setFormData({ ...formData, jagadguruName: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peetha">Peetha / Lineage</Label>
                    <Input
                      id="peetha"
                      value={formData.peetha}
                      onChange={(e) => setFormData({ ...formData, peetha: e.target.value })}
                      placeholder="Enter peetha name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="samadhiYear">Samadhi Year</Label>
                    <Input
                      id="samadhiYear"
                      type="number"
                      value={formData.samadhiYear || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        samadhiYear: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      placeholder="Enter year"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Festivals</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Festival name"
                    value={festivalName}
                    onChange={(e) => setFestivalName(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={festivalDate}
                    onChange={(e) => setFestivalDate(e.target.value)}
                    className="w-40"
                  />
                  <Button type="button" variant="outline" onClick={handleAddFestival}>Add</Button>
                </div>
                {formData.festivals.length > 0 && (
                  <div className="border rounded-lg p-2 space-y-1 mt-2">
                    {formData.festivals.map((fest, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-muted rounded px-3 py-2">
                        <div>
                          <span className="font-medium">{fest.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{fest.date}</span>
                        </div>
                        <button type="button" onClick={() => setFormData({ ...formData, festivals: formData.festivals.filter((_, i) => i !== idx) })} className="hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Abhishekam Schedule</Label>
                <div className="flex gap-2">
                  <Input placeholder="Day" value={abhishekamDay} onChange={(e) => setAbhishekamDay(e.target.value)} />
                  <Input type="time" value={abhishekamTime} onChange={(e) => setAbhishekamTime(e.target.value)} className="w-32" />
                  <Input placeholder="Type" value={abhishekamType} onChange={(e) => setAbhishekamType(e.target.value)} />
                  <Button type="button" variant="outline" onClick={handleAddAbhishekam}>Add</Button>
                </div>
                {formData.abhishekamSchedule.length > 0 && (
                  <div className="border rounded-lg p-2 space-y-1 mt-2">
                    {formData.abhishekamSchedule.map((schedule, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-muted rounded px-3 py-2">
                        <span className="text-sm">{schedule.day} at {schedule.time} - {schedule.type}</span>
                        <button type="button" onClick={() => setFormData({ ...formData, abhishekamSchedule: formData.abhishekamSchedule.filter((_, i) => i !== idx) })} className="hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="eligibility" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="darshanPriority">Darshan Priority</Label>
                <select
                  id="darshanPriority"
                  value={formData.darshanPriority}
                  onChange={(e) => setFormData({ ...formData, darshanPriority: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="vip">VIP</option>
                  <option value="general">General</option>
                  <option value="special">Special</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Eligible Pujas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Puja name"
                    value={pujaInput}
                    onChange={(e) => setPujaInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPuja())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddPuja}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.eligiblePujas.map((puja, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                      {puja}
                      <button type="button" onClick={() => setFormData({ ...formData, eligiblePujas: formData.eligiblePujas.filter((_, i) => i !== idx) })} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Eligible Sevas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Seva name"
                    value={sevaInput}
                    onChange={(e) => setSevaInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSeva())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddSeva}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.eligibleSevas.map((seva, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                      {seva}
                      <button type="button" onClick={() => setFormData({ ...formData, eligibleSevas: formData.eligibleSevas.filter((_, i) => i !== idx) })} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="closure" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Temporary Closure</Label>
                  <p className="text-xs text-muted-foreground">Close sacred entity temporarily</p>
                </div>
                <Switch
                  checked={formData.temporaryClosure.isClosed}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    temporaryClosure: { ...formData.temporaryClosure, isClosed: checked }
                  })}
                />
              </div>

              {formData.temporaryClosure.isClosed && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From Date</Label>
                      <Input
                        type="date"
                        value={formData.temporaryClosure.fromDate || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          temporaryClosure: { ...formData.temporaryClosure, fromDate: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        value={formData.temporaryClosure.toDate || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          temporaryClosure: { ...formData.temporaryClosure, toDate: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Textarea
                      value={formData.temporaryClosure.reason || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        temporaryClosure: { ...formData.temporaryClosure, reason: e.target.value }
                      })}
                      placeholder="Reason for closure"
                      rows={2}
                    />
                  </div>
                </div>
              )}
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
              {sacred ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
