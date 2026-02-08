import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Save, Package, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Asset, AssetLocation, AssetCategory } from '@/types/assets';
import { generateVisualFingerprint } from '@/lib/assets/cv-verification';
import { getSubCategoryFieldGroup, getSubCategoriesForMajorCategory } from '@/lib/assets/subcategory-field-config';
import { CategorySpecificFields } from '@/components/assets/CategorySpecificFields';
import { createAssetAuditEntry } from '@/lib/assets/asset-audit-store';
import { getEmployees } from '@/lib/hr-employee-store';
import { departments as hrDepartments } from '@/data/hr-dummy-data';

interface AssetMasterInlineFormProps {
  asset?: Asset | null;
  locations: AssetLocation[];
  categories: Array<{ id: string; name: string; category: AssetCategory; subCategory?: string }>;
  onSave: (asset: Partial<Asset>) => void;
  onCancel: () => void;
  onCategoryAdd?: (category: { id: string; name: string; category: AssetCategory }) => void;
}

// Tags Input Component
function TagsInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]">
        {tags.map((tag) => (
          <div
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
          >
            <span>{tag}</span>
            <button
          type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-primary/80"
        >
              <X className="h-3 w-3" />
            </button>
      </div>
        ))}
            <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder={tags.length === 0 ? 'Type and press Enter to add tags' : ''}
          className="flex-1 min-w-[150px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>
      <p className="text-xs text-muted-foreground">Press Enter to add a tag</p>
    </div>
  );
}

export function AssetMasterInlineForm({
  asset,
  locations,
  categories,
  onSave,
  onCancel,
  onCategoryAdd,
}: AssetMasterInlineFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('classification');
  
  const [formData, setFormData] = useState({
    // Tab 1: Classification & Asset-Specific Details
    name: '',
    category: 'movable' as AssetCategory,
    majorCategoryId: '',
    subCategory: '',
    jewelryType: '',
    description: '',
    categorySpecificFields: {} as Record<string, string | number | File>,
    
    // Tab 2: General Information
    acquisitionType: '',
    donorName: '',
    acquisitionDate: '',
    department: '',
    custodian: '',
    
    // Tab 3: Location & Media
    buildingSection: '',
    roomAreaName: '',
    storageType: '' as 'Vault' | 'Store Room' | 'Open Area' | '',
    lockerReference: '',
    assetImages: [] as string[],
    assetVideo: '',
    
    // Tab 4: Documents & Additional Details
    supportingDocuments: [] as Array<{ type: string; name: string; url: string; uploadedAt: string }>,
    tags: [] as string[],
    internalNotes: '',
    remarks: '',
  });

  // Fetch Department and Custodian from HR module
  const departmentOptions = useMemo(() => {
    return hrDepartments
      .filter(dept => dept.status === 'active')
      .map(dept => ({ value: dept.id, label: dept.name }));
  }, []);

  const custodianOptions = useMemo(() => {
    const employees = getEmployees();
    return employees.map(emp => ({ 
      value: emp.id, 
      label: `${emp.name}${emp.designation ? ` - ${emp.designation}` : ''}` 
    }));
  }, []);

  const [locationOptions, setLocationOptions] = useState<Array<{ value: string; label: string }>>(
    locations.map(loc => ({ value: loc.id, label: loc.fullPath }))
  );

  // Dynamic options for dropdowns with Add functionality
  const [assetTypeOptions, setAssetTypeOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'movable', label: 'MOVABLE' },
    { value: 'immovable', label: 'IMMOVABLE' },
  ]);
  const [subCategoryOptionsState, setSubCategoryOptionsState] = useState<Array<{ value: string; label: string }>>([]);
  const [jewelryTypeOptions, setJewelryTypeOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'Necklace', label: 'Necklace' },
    { value: 'Ring', label: 'Ring' },
    { value: 'Earrings', label: 'Earrings' },
    { value: 'Bracelet', label: 'Bracelet' },
    { value: 'Bangle', label: 'Bangle' },
    { value: 'Chain', label: 'Chain' },
    { value: 'Pendant', label: 'Pendant' },
    { value: 'Anklet', label: 'Anklet' },
    { value: 'Bangle Set', label: 'Bangle Set' },
    { value: 'Nose Pin', label: 'Nose Pin' },
    { value: 'Hair Pin', label: 'Hair Pin' },
    { value: 'Crown', label: 'Crown' },
    { value: 'Tiara', label: 'Tiara' },
    { value: 'Other', label: 'Other' },
  ]);
  const [acquisitionTypeOptions, setAcquisitionTypeOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'purchased', label: 'Purchase' },
    { value: 'donated', label: 'Donation' },
    { value: 'constructed', label: 'Constructed' },
    { value: 'inherited', label: 'Inherited' },
  ]);
  const [storageTypeOptions, setStorageTypeOptions] = useState<Array<{ value: string; label: string }>>([
    { value: 'Vault', label: 'Vault' },
    { value: 'Store Room', label: 'Store Room' },
    { value: 'Open Area', label: 'Open Area' },
  ]);

  // Filter categories by Asset Type
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.category === formData.category);
  }, [categories, formData.category]);

  const majorCategoryOptions = useMemo(() => {
    return filteredCategories.map(cat => ({ value: cat.id, label: cat.name }));
  }, [filteredCategories]);

  // Get selected major category
  const selectedMajorCategory = useMemo(() => {
    return categories.find(cat => cat.id === formData.majorCategoryId);
  }, [categories, formData.majorCategoryId]);

  // Get sub category options from selected major category
  const subCategoryOptionsBase = useMemo(() => {
    if (!selectedMajorCategory) return [];
    
    // First, try to get subcategories from the majorCategorySubCategories mapping
    const subCategories = getSubCategoriesForMajorCategory(selectedMajorCategory.name);
    if (subCategories.length > 0) {
      return subCategories.map(sc => ({ value: sc, label: sc }));
    }
    
    // Fallback: Use subCategory from the category if available
    if (selectedMajorCategory.subCategory) {
      return [{ value: selectedMajorCategory.subCategory, label: selectedMajorCategory.subCategory }];
    }
    
    // Last resort: Try to get from field groups based on category name
    const fieldGroup = getSubCategoryFieldGroup(selectedMajorCategory.name);
    if (fieldGroup) {
      return fieldGroup.subCategories.map(sc => ({ value: sc, label: sc }));
    }
    
    return [];
  }, [selectedMajorCategory]);

  // Merge base subcategories with dynamically added ones
  const subCategoryOptions = useMemo(() => {
    const baseValues = new Set(subCategoryOptionsBase.map(opt => opt.value));
    const dynamic = subCategoryOptionsState.filter(opt => !baseValues.has(opt.value));
    return [...subCategoryOptionsBase, ...dynamic];
  }, [subCategoryOptionsBase, subCategoryOptionsState]);

  // Get dynamic fields based on Sub Category selection
  const dynamicFieldsConfig = useMemo(() => {
    if (!formData.subCategory) return [];
    const fieldGroup = getSubCategoryFieldGroup(formData.subCategory);
    return fieldGroup?.fields || [];
  }, [formData.subCategory]);

  useEffect(() => {
    if (asset) {
      // Find major category ID from categories prop
      const majorCat = categories.find(cat => cat.id === asset.id || cat.name === asset.name);
      setFormData({
        name: asset.name,
        category: asset.category,
        majorCategoryId: majorCat?.id || '',
        subCategory: asset.subCategory || '',
        jewelryType: '',
        description: asset.description || '',
        categorySpecificFields: asset.categorySpecificFields || {},
        acquisitionType: asset.acquisitionType || '',
        donorName: asset.donorName || '',
        acquisitionDate: asset.acquisitionDate || '',
        department: '',
        custodian: asset.currentCustodianName || '',
        buildingSection: '',
        roomAreaName: '',
        storageType: '' as 'Vault' | 'Store Room' | 'Open Area' | '',
        lockerReference: '',
        assetImages: asset.additionalImages || [],
        assetVideo: '',
        supportingDocuments: asset.documents || [],
        tags: [],
        internalNotes: '',
        remarks: '',
      });
    } else {
      setFormData({
        name: '',
        category: 'movable',
        majorCategoryId: '',
        subCategory: '',
        jewelryType: '',
        description: '',
        categorySpecificFields: {},
        acquisitionType: '',
        donorName: '',
        acquisitionDate: '',
        department: '',
        custodian: '',
        buildingSection: '',
        roomAreaName: '',
        storageType: '',
        lockerReference: '',
        assetImages: [],
        assetVideo: '',
        supportingDocuments: [],
        tags: [],
        internalNotes: '',
        remarks: '',
      });
    }
  }, [asset, locations, categories]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, multiple = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
        if (multiple) {
          setFormData(prev => ({
            ...prev,
            assetImages: [...prev.assetImages, base64],
          }));
      } else {
          setFormData(prev => ({ ...prev, assetImages: [base64] }));
      }
    };
    reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      assetImages: prev.assetImages.filter((_, i) => i !== index),
    }));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, assetVideo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc = {
          type: file.type || 'document',
          name: file.name,
          url: reader.result as string,
          uploadedAt: new Date().toISOString(),
        };
        setFormData(prev => ({
          ...prev,
          supportingDocuments: [...prev.supportingDocuments, newDoc],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const updateForm = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Draft Saved',
        description: 'Asset data has been saved as draft.',
      });
    }, 500);
  };

  const handleCreate = () => {
    setIsSaving(true);
    
    // Get department and custodian names
    const selectedDepartment = hrDepartments.find(d => d.id === formData.department);
    const selectedCustodian = getEmployees().find(e => e.id === formData.custodian);
    // Get custodian name from options (handles both employee and manually added custodians)
    const custodianOption = custodianOptions.find(opt => opt.value === formData.custodian);
    const custodianName = selectedCustodian?.name || custodianOption?.label || formData.custodian || '';

    // Convert categorySpecificFields to handle File objects
    const processedCategoryFields: Record<string, string | number> = {};
    Object.entries(formData.categorySpecificFields).forEach(([key, value]) => {
      if (value instanceof File) {
        // In a real app, you'd upload the file and store the URL
        // For now, we'll store the file name
        processedCategoryFields[key] = value.name;
      } else {
        processedCategoryFields[key] = value;
      }
    });

    // Generate CV fingerprint from first image if available
    const cvFingerprint = formData.assetImages.length > 0
      ? generateVisualFingerprint(formData.assetImages[0])
      : undefined;

    const assetId = asset?.id || `ast-${Date.now()}`;
    const userId = user?.id || 'user-1';
    const userName = user?.name || 'Current User';

    // Generate asset code
    const assetCode = asset?.assetCode || `AST-${String(Date.now()).slice(-6)}`;
    
    const assetData: Partial<Asset> = {
      id: assetId,
      assetCode: assetCode,
      name: formData.name,
      category: formData.category,
      subCategory: formData.subCategory,
      description: formData.description,
      categorySpecificFields: {
        ...processedCategoryFields,
        ...(formData.jewelryType ? { jewelryType: formData.jewelryType } : {}),
      },
      acquisitionType: (formData.acquisitionType || 'purchased') as any,
      acquisitionDate: formData.acquisitionDate || undefined,
      donorName: formData.donorName || undefined,
      currentLocationId: '',
      currentLocationName: formData.buildingSection && formData.roomAreaName 
        ? `${formData.buildingSection} > ${formData.roomAreaName}`
        : formData.buildingSection || formData.roomAreaName || '',
      currentCustodianId: formData.custodian || undefined,
      currentCustodianName: custodianName || undefined,
      currentCustodianType: selectedCustodian ? 'individual' : undefined,
      primaryImage: formData.assetImages[0] || undefined,
      additionalImages: formData.assetImages.slice(1),
      documents: formData.supportingDocuments,
      // Required fields with defaults
      sensitivity: 'normal' as any,
      condition: 'good' as any,
      lifecycleStatus: 'active' as any,
      currentValuation: 0,
      valuationDate: formData.acquisitionDate || new Date().toISOString().split('T')[0],
      customFields: {
        department: selectedDepartment?.name || formData.department || '',
        departmentId: formData.department || '',
        custodianId: formData.custodian || '',
        buildingSection: formData.buildingSection || '',
        roomAreaName: formData.roomAreaName || '',
        storageType: formData.storageType || '',
        lockerReference: formData.lockerReference || '',
        assetVideo: formData.assetVideo || '',
        tags: formData.tags.join(',') || '',
        internalNotes: formData.internalNotes || '',
        remarks: formData.remarks || '',
      },
      status: 'active',
      createdAt: asset?.createdAt || new Date().toISOString(),
      createdBy: userId,
      createdByName: userName,
      updatedAt: new Date().toISOString(),
      cvFingerprint,
    };

    setTimeout(() => {
      setIsSaving(false);
      
      // Create audit entry
      try {
        createAssetAuditEntry(assetData as Asset, asset ? 'updated' : 'created', userId, userName);
      } catch (error) {
        console.error('Error creating audit entry:', error);
      }
      
      onSave(assetData);
      toast({
        title: asset ? 'Asset Updated' : 'Asset Created',
        description: `${formData.name || 'Asset'} has been ${asset ? 'updated' : 'added'} to the system.`,
      });
    }, 1000);
  };

  const tabs = [
    { id: 'classification', label: 'Classification & Details' },
    { id: 'general', label: 'General Information' },
    { id: 'location', label: 'Location & Media' },
    { id: 'documents', label: 'Documents & Additional' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <ScrollArea className="flex-1 py-6">
          {/* Tab 1: Classification & Asset-Specific Details */}
          <TabsContent value="classification" className="m-0 space-y-6">
            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Classification & Asset-Specific Details</h3>
              <p className="text-sm text-muted-foreground">Enter the basic asset classification and category-specific details</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="form-field">
                <Label className="form-label">
                  Asset Name <span className="form-required">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  placeholder="Enter asset name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="form-field">
                <Label className="form-label">
                  Asset Type <span className="form-required">*</span>
                </Label>
                <SearchableSelect
                  options={assetTypeOptions}
                  value={formData.category}
                  onChange={(value) => {
                    updateForm('category', value);
                    updateForm('majorCategoryId', '');
                    updateForm('subCategory', '');
                    updateForm('categorySpecificFields', {});
                  }}
                  placeholder="Select asset type"
                  addNewLabel="+ Add Asset Type"
                  onAddNew={(name: string) => {
                    const newType = {
                      value: name.trim().toLowerCase(),
                      label: name.trim().toUpperCase(),
                    };
                    setAssetTypeOptions([...assetTypeOptions, newType]);
                    return newType;
                  }}
                />
              </div>
              <div className="form-field">
                <Label className="form-label">
                  Major Category <span className="form-required">*</span>
                </Label>
                <SearchableSelect
                  options={majorCategoryOptions}
                  value={formData.majorCategoryId}
                  onChange={(value) => {
                    updateForm('majorCategoryId', value);
                    updateForm('subCategory', '');
                    updateForm('categorySpecificFields', {});
                  }}
                  placeholder={formData.category ? "Select major category" : "Select Asset Type first"}
                  addNewLabel="+ Add Major Category"
                  disabled={!formData.category}
                  onAddNew={(name: string) => {
                    const newCategory = {
                      id: `cat-${Date.now()}`,
                      name: name.trim(),
                      category: formData.category,
                    };
                    if (onCategoryAdd) {
                      onCategoryAdd(newCategory);
                    }
                    return { value: newCategory.id, label: newCategory.name };
                  }}
                />
              </div>
            </div>

            {formData.majorCategoryId && (
            <div className="grid grid-cols-2 gap-6">
              <div className="form-field">
                  <Label className="form-label">
                    Sub Category <span className="form-required">*</span>
                  </Label>
                <SearchableSelect
                    options={subCategoryOptions}
                    value={formData.subCategory}
                    onChange={(value) => {
                      updateForm('subCategory', value);
                      updateForm('jewelryType', '');
                      updateForm('categorySpecificFields', {});
                    }}
                    placeholder="Select sub category"
                    addNewLabel="+ Add Sub Category"
                    disabled={!formData.majorCategoryId}
                  onAddNew={(name: string) => {
                      const newSubCat = {
                        value: name.trim(),
                        label: name.trim(),
                      };
                      setSubCategoryOptionsState([...subCategoryOptionsState, newSubCat]);
                      return newSubCat;
                  }}
                />
              </div>
                {/* Type of Jewelry field - shown for Sacred Assets subcategories */}
                {selectedMajorCategory?.name === 'Sacred Assets' && 
                 (formData.subCategory === 'Gold Ornaments' || 
                  formData.subCategory === 'Silver Items' || 
                  formData.subCategory === 'Precious Stones') && (
                <div className="form-field">
                    <Label className="form-label">Type of Jewelry</Label>
                    <SearchableSelect
                      options={jewelryTypeOptions}
                      value={formData.jewelryType}
                      onChange={(value) => updateForm('jewelryType', value)}
                      placeholder="Select jewelry type"
                      addNewLabel="+ Add Jewelry Type"
                      onAddNew={(name: string) => {
                        const newType = {
                          value: name.trim(),
                          label: name.trim(),
                        };
                        setJewelryTypeOptions([...jewelryTypeOptions, newType]);
                        return newType;
                      }}
                  />
                </div>
                )}
              </div>
            )}

                <div className="form-field">
              <Label className="form-label">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateForm('description', e.target.value)}
                rows={4}
                placeholder="Enter asset description"
                  />
                </div>

            {/* Dynamic Category-Specific Fields */}
            {dynamicFieldsConfig.length > 0 && (
              <CategorySpecificFields
                fields={dynamicFieldsConfig}
                values={formData.categorySpecificFields}
                onChange={(key, value) => {
                  updateForm('categorySpecificFields', {
                    ...formData.categorySpecificFields,
                    [key]: value,
                  });
                }}
              />
            )}
          </TabsContent>

          {/* Tab 2: General Information */}
          <TabsContent value="general" className="m-0 space-y-6">
            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-semibold text-foreground">General Information</h3>
              <p className="text-sm text-muted-foreground">Enter acquisition, valuation, and general asset information</p>
            </div>
            
                <div className="grid grid-cols-2 gap-6">
              <div className="form-field">
                <Label className="form-label">Acquisition Type</Label>
                <SearchableSelect
                  options={acquisitionTypeOptions}
                  value={formData.acquisitionType}
                  onChange={(value) => updateForm('acquisitionType', value)}
                  placeholder="Select acquisition type"
                  addNewLabel="+ Add Acquisition Type"
                  onAddNew={(name: string) => {
                    const newType = {
                      value: name.trim().toLowerCase().replace(/\s+/g, '_'),
                      label: name.trim(),
                    };
                    setAcquisitionTypeOptions([...acquisitionTypeOptions, newType]);
                    return newType;
                  }}
                />
              </div>
              {formData.acquisitionType === 'donated' && (
                  <div className="form-field">
                    <Label className="form-label">Donor Name</Label>
                    <Input
                      value={formData.donorName}
                      onChange={(e) => updateForm('donorName', e.target.value)}
                      placeholder="Enter donor name"
                    />
                </div>
              )}
            </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                <Label className="form-label">Acquisition Date</Label>
                  <Input
                    type="date"
                  value={formData.acquisitionDate}
                  onChange={(e) => updateForm('acquisitionDate', e.target.value)}
                  />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="form-field">
                <Label className="form-label">Department</Label>
                <SearchableSelect
                  options={departmentOptions}
                  value={formData.department}
                  onChange={(value) => updateForm('department', value)}
                  placeholder="Select department"
                  addNewLabel="+ Add Department"
                  onAddNew={(name: string) => {
                    const newDept = {
                      value: `dept-${Date.now()}`,
                      label: name.trim(),
                    };
                    // Note: In a real app, this would add to HR module
                    return newDept;
                  }}
                />
              </div>
                <div className="form-field">
                <Label className="form-label">Custodian (Responsible Person)</Label>
                <SearchableSelect
                  options={custodianOptions}
                  value={formData.custodian}
                  onChange={(value) => updateForm('custodian', value)}
                  placeholder="Select custodian"
                  addNewLabel="+ Add Custodian"
                  onAddNew={(name: string) => {
                    const newCustodian = {
                      value: `cust-${Date.now()}`,
                      label: name.trim(),
                    };
                    // Note: In a real app, this would add to HR module
                    return newCustodian;
                  }}
                    />
                  </div>
            </div>
          </TabsContent>

          {/* Tab 3: Location & Media */}
          <TabsContent value="location" className="m-0 space-y-6">
            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Location & Media</h3>
              <p className="text-sm text-muted-foreground">Set asset storage details and media files</p>
            </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="form-field">
                <Label className="form-label">Building / Section</Label>
                    <Input
                  value={formData.buildingSection}
                  onChange={(e) => updateForm('buildingSection', e.target.value)}
                  placeholder="Enter building or section"
                    />
                  </div>
                  <div className="form-field">
                <Label className="form-label">Room / Area Name</Label>
                <Input
                  value={formData.roomAreaName}
                  onChange={(e) => updateForm('roomAreaName', e.target.value)}
                  placeholder="Enter room or area name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="form-field">
                <Label className="form-label">Storage Type</Label>
                    <SearchableSelect
                  options={storageTypeOptions}
                  value={formData.storageType}
                  onChange={(value) => updateForm('storageType', value)}
                  placeholder="Select storage type"
                  addNewLabel="+ Add Storage Type"
                      onAddNew={(name: string) => {
                    const newType = {
                      value: name.trim(),
                      label: name.trim(),
                    };
                    setStorageTypeOptions([...storageTypeOptions, newType]);
                    return newType;
                      }}
                    />
                  </div>
              {formData.storageType === 'Vault' && (
                <div className="form-field">
                  <Label className="form-label">Locker Reference</Label>
                  <Input
                    value={formData.lockerReference}
                    onChange={(e) => updateForm('lockerReference', e.target.value)}
                    placeholder="Enter locker reference"
                  />
              </div>
            )}
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-base font-semibold mb-4">Media Files</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="form-field">
                  <Label className="form-label">Asset Images</Label>
                    <Input
                      type="file"
                      accept="image/*"
                    multiple
                      onChange={(e) => handleImageUpload(e, true)}
                    />
                  {formData.assetImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                      {formData.assetImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                            alt={`Asset ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
                <div className="form-field">
                  <Label className="form-label">Asset Video (Optional)</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                  {formData.assetVideo && (
                    <div className="mt-2 text-sm text-muted-foreground">Video uploaded</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Documents & Additional Details */}
          <TabsContent value="documents" className="m-0 space-y-6">
            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Documents & Additional Details</h3>
              <p className="text-sm text-muted-foreground">Upload documents and add additional information</p>
            </div>

              <div className="form-field">
              <Label className="form-label">Supporting Documents</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                  onChange={handleDocumentUpload}
                />
              {formData.supportingDocuments.length > 0 && (
                  <div className="mt-2 space-y-1">
                  {formData.supportingDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{doc.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                          updateForm('supportingDocuments', formData.supportingDocuments.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
            </div>

                <div className="form-field">
              <Label className="form-label">Tags / Keywords</Label>
              <TagsInput
                tags={formData.tags}
                onChange={(tags) => updateForm('tags', tags)}
                  />
                </div>

                <div className="form-field">
              <Label className="form-label">Internal Notes</Label>
              <Textarea
                value={formData.internalNotes}
                onChange={(e) => updateForm('internalNotes', e.target.value)}
                rows={4}
                placeholder="Enter internal notes"
              />
                </div>

                <div className="form-field">
              <Label className="form-label">Remarks</Label>
              <Textarea
                value={formData.remarks}
                onChange={(e) => updateForm('remarks', e.target.value)}
                rows={4}
                placeholder="Enter remarks"
              />
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer */}
      <div className="flex items-center justify-between py-4 border-t border-border mt-auto">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleCreate} disabled={isSaving}>
            <Package className="h-4 w-4 mr-2" />
            {asset ? 'Update Asset' : 'Create Asset'}
          </Button>
        </div>
      </div>
    </div>
  );
}
