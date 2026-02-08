import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { Branch, BranchType, BranchStatus } from '@/types/branch';
import { getRegions } from '@/lib/branch-store';

interface BranchFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branch?: Branch;
    onSubmit: (data: Partial<Branch>) => void;
}

export function BranchFormModal({ open, onOpenChange, branch, onSubmit }: BranchFormModalProps) {
    const isEditMode = !!branch;
    const regions = getRegions();

    // Form state
    const [formData, setFormData] = useState<Partial<Branch>>({
        branchName: branch?.branchName || '',
        branchCode: branch?.branchCode || '',
        branchType: branch?.branchType || 'temple',
        status: branch?.status || 'active',
        hierarchyLevel: branch?.hierarchyLevel || 1,
        regionId: branch?.regionId || '',
        contactPerson: branch?.contactPerson || '',
        contactPhonePrimary: branch?.contactPhonePrimary || '',
        contactEmailPrimary: branch?.contactEmailPrimary || '',
        websiteUrl: branch?.websiteUrl || '',
        addressLine1: branch?.addressLine1 || '',
        addressLine2: branch?.addressLine2 || '',
        city: branch?.city || '',
        state: branch?.state || '',
        pinCode: branch?.pinCode || '',
        country: branch?.country || 'India',
        operationalStartDate: branch?.operationalStartDate || '',
        currentCapacity: branch?.currentCapacity || 0,
    });

    const handleChange = (field: keyof Branch, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.branchName || !formData.branchCode) {
            toast.error('Branch name and code are required');
            return;
        }

        onSubmit(formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update branch information and details'
                            : 'Create a new branch in the directory'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="contact">Contact &amp; Location</TabsTrigger>
                            <TabsTrigger value="operational">Operational</TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="branchName">Branch Name *</Label>
                                    <Input
                                        id="branchName"
                                        value={formData.branchName}
                                        onChange={(e) => handleChange('branchName', e.target.value)}
                                        placeholder="Enter branch name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="branchCode">Branch Code *</Label>
                                    <Input
                                        id="branchCode"
                                        value={formData.branchCode}
                                        onChange={(e) => handleChange('branchCode', e.target.value.toUpperCase())}
                                        placeholder="e.g., KGG-001"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="branchType">Branch Type</Label>
                                    <Select
                                        value={formData.branchType}
                                        onValueChange={(value) => handleChange('branchType', value as BranchType)}
                                    >
                                        <SelectTrigger id="branchType">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="head_office">Head Office</SelectItem>
                                            <SelectItem value="regional_office">Regional Office</SelectItem>
                                            <SelectItem value="temple">Temple</SelectItem>
                                            <SelectItem value="subsidiary_temple">Subsidiary Temple</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleChange('status', value as BranchStatus)}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="under_setup">Under Setup</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="regionId">Region</Label>
                                    <Select
                                        value={formData.regionId}
                                        onValueChange={(value) => handleChange('regionId', value)}
                                    >
                                        <SelectTrigger id="regionId">
                                            <SelectValue placeholder="Select region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {regions.map(region => (
                                                <SelectItem key={region.id} value={region.id}>
                                                    {region.regionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hierarchyLevel">Hierarchy Level</Label>
                                    <Input
                                        id="hierarchyLevel"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.hierarchyLevel}
                                        onChange={(e) => handleChange('hierarchyLevel', parseInt(e.target.value) || 1)}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Contact & Location Tab */}
                        <TabsContent value="contact" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactPerson">Contact Person</Label>
                                    <Input
                                        id="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={(e) => handleChange('contactPerson', e.target.value)}
                                        placeholder="Full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactPhonePrimary">Primary Phone</Label>
                                    <Input
                                        id="contactPhonePrimary"
                                        value={formData.contactPhonePrimary}
                                        onChange={(e) => handleChange('contactPhonePrimary', e.target.value)}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmailPrimary">Primary Email</Label>
                                    <Input
                                        id="contactEmailPrimary"
                                        type="email"
                                        value={formData.contactEmailPrimary}
                                        onChange={(e) => handleChange('contactEmailPrimary', e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="websiteUrl">Website URL</Label>
                                    <Input
                                        id="websiteUrl"
                                        type="url"
                                        value={formData.websiteUrl}
                                        onChange={(e) => handleChange('websiteUrl', e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="addressLine1">Address Line 1</Label>
                                <Input
                                    id="addressLine1"
                                    value={formData.addressLine1}
                                    onChange={(e) => handleChange('addressLine1', e.target.value)}
                                    placeholder="Street address"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="addressLine2">Address Line 2</Label>
                                <Input
                                    id="addressLine2"
                                    value={formData.addressLine2}
                                    onChange={(e) => handleChange('addressLine2', e.target.value)}
                                    placeholder="Apt, suite, etc. (optional)"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => handleChange('city', e.target.value)}
                                        placeholder="City name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        value={formData.state}
                                        onChange={(e) => handleChange('state', e.target.value)}
                                        placeholder="State name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pinCode">PIN Code</Label>
                                    <Input
                                        id="pinCode"
                                        value={formData.pinCode}
                                        onChange={(e) => handleChange('pinCode', e.target.value)}
                                        placeholder="XXXXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    placeholder="Country name"
                                />
                            </div>
                        </TabsContent>

                        {/* Operational Tab */}
                        <TabsContent value="operational" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="operationalStartDate">Operational Start Date</Label>
                                    <Input
                                        id="operationalStartDate"
                                        type="date"
                                        value={formData.operationalStartDate}
                                        onChange={(e) => handleChange('operationalStartDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currentCapacity">Current Capacity (devotees/day)</Label>
                                    <Input
                                        id="currentCapacity"
                                        type="number"
                                        min="0"
                                        value={formData.currentCapacity}
                                        onChange={(e) => handleChange('currentCapacity', parseInt(e.target.value) || 0)}
                                        placeholder="e.g., 5000"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {isEditMode ? 'Update Branch' : 'Create Branch'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
