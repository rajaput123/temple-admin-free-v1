import type { CategoryFieldConfig } from './category-field-config';

export interface SubCategoryFieldGroup {
  subCategories: string[];
  fields: CategoryFieldConfig[];
}

/**
 * Mapping of Major Categories to their Sub Categories
 */
export const majorCategorySubCategories: Record<string, string[]> = {
  // MOVABLE - Sacred Assets
  'Sacred Assets': [
    'Gold Ornaments',
    'Silver Items',
    'Precious Stones',
    'Movable Idols',
    'Temple Crowns',
    'Sacred Vessels',
    'Historical Artifacts',
  ],
  // MOVABLE - Inventory Assets
  'Inventory Assets': [
    'Pooja Items',
    'Kitchen Equipment',
    'Furniture',
    'Electrical Equipment',
    'Office Equipment',
    'Sound System',
    'CCTV Equipment',
    'Vehicles',
    'Musical Instruments',
  ],
  // MOVABLE - Financial Assets
  'Financial Assets': [
    'Cash in Hand',
    'Bank Accounts',
    'Fixed Deposits',
    'Endowment Funds',
    'Investments',
  ],
  // IMMOVABLE - Land
  'Land': [
    'Agricultural Land',
    'Commercial Land',
    'Residential Land',
    'Donated Land',
    'Leased Land',
  ],
  // IMMOVABLE - Buildings
  'Buildings': [
    'Main Temple Building',
    'Mandapam / Hall',
    'Guest House',
    'Priest Quarters',
    'Shops',
    'Office Building',
    'Storage Room',
  ],
  // IMMOVABLE - Infrastructure
  'Infrastructure': [
    'Compound Wall',
    'Borewell',
    'Water Tank',
    'Electrical Installation',
    'Solar Plant',
    'Drainage System',
    'Parking Area',
  ],
};

/**
 * Field groups for different subcategory types
 */
export const subCategoryFieldGroups: Record<string, SubCategoryFieldGroup> = {
  // Gold/Silver/Precious Items
  'gold_silver_precious': {
    subCategories: [
      'Gold Ornaments',
      'Silver Items',
      'Precious Stones',
      'Temple Crowns',
    ],
    fields: [
      {
        key: 'weight',
        label: 'Weight',
        type: 'number',
        placeholder: 'Enter weight',
      },
      {
        key: 'weightUnit',
        label: 'Weight Unit',
        type: 'select',
        options: ['Gram', 'Kg'],
      },
      {
        key: 'purity',
        label: 'Purity',
        type: 'text',
        placeholder: 'e.g., 22K, 24K, 999',
      },
      {
        key: 'lockerNumber',
        label: 'Locker Number',
        type: 'text',
        placeholder: 'Enter locker number',
      },
      {
        key: 'valuationDate',
        label: 'Valuation Date',
        type: 'date',
      },
      {
        key: 'valuationAmount',
        label: 'Valuation Amount',
        type: 'number',
        placeholder: 'Enter valuation amount',
      },
    ],
  },
  // Movable Idols and Sacred Vessels
  'movable_idols_sacred': {
    subCategories: [
      'Movable Idols',
      'Sacred Vessels',
    ],
    fields: [
      {
        key: 'deityName',
        label: 'Deity Name',
        type: 'text',
        placeholder: 'Enter deity name',
      },
      {
        key: 'material',
        label: 'Material',
        type: 'select',
        options: ['Stone', 'Metal', 'Wood', 'Marble', 'Brass', 'Silver', 'Gold', 'Other'],
      },
      {
        key: 'dimensions',
        label: 'Dimensions',
        type: 'text',
        placeholder: 'e.g., Height x Width x Depth',
      },
      {
        key: 'storageType',
        label: 'Storage Type',
        type: 'select',
        options: ['Vault', 'Locker', 'Safe', 'Display', 'Other'],
      },
      {
        key: 'ritualSignificance',
        label: 'Ritual Significance',
        type: 'textarea',
        placeholder: 'Describe ritual significance',
      },
    ],
  },
  // Historical Artifacts
  'historical_artifacts': {
    subCategories: [
      'Historical Artifacts',
    ],
    fields: [
      {
        key: 'historicalPeriod',
        label: 'Historical Period',
        type: 'text',
        placeholder: 'e.g., 1950, Ancient, Medieval',
      },
      {
        key: 'provenance',
        label: 'Provenance',
        type: 'text',
        placeholder: 'Origin/history of the artifact',
      },
      {
        key: 'material',
        label: 'Material',
        type: 'text',
        placeholder: 'Enter material',
      },
      {
        key: 'condition',
        label: 'Condition',
        type: 'select',
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Restoration'],
      },
      {
        key: 'conservationNotes',
        label: 'Conservation Notes',
        type: 'textarea',
        placeholder: 'Enter conservation requirements',
      },
    ],
  },
  // Vehicles
  'vehicles': {
    subCategories: [
      'Vehicles',
    ],
    fields: [
      {
        key: 'registrationNumber',
        label: 'Registration Number',
        type: 'text',
        placeholder: 'e.g., KA-01-AB-1234',
      },
      {
        key: 'engineNumber',
        label: 'Engine Number',
        type: 'text',
        placeholder: 'Enter engine number',
      },
      {
        key: 'chassisNumber',
        label: 'Chassis Number',
        type: 'text',
        placeholder: 'Enter chassis number',
      },
      {
        key: 'makeModel',
        label: 'Make/Model',
        type: 'text',
        placeholder: 'e.g., Toyota Innova',
      },
      {
        key: 'yearOfManufacture',
        label: 'Year of Manufacture',
        type: 'number',
        placeholder: 'e.g., 2020',
      },
      {
        key: 'insuranceExpiryDate',
        label: 'Insurance Expiry Date',
        type: 'date',
      },
      {
        key: 'rcDocument',
        label: 'RC Document',
        type: 'file',
      },
    ],
  },
  // Equipment and Furniture
  'equipment_furniture': {
    subCategories: [
      'Pooja Items',
      'Kitchen Equipment',
      'Furniture',
      'Electrical Equipment',
      'Office Equipment',
      'Sound System',
      'CCTV Equipment',
      'Musical Instruments',
    ],
    fields: [
      {
        key: 'serialNumber',
        label: 'Serial Number',
        type: 'text',
        placeholder: 'Enter serial number',
      },
      {
        key: 'brand',
        label: 'Brand',
        type: 'text',
        placeholder: 'Enter brand name',
      },
      {
        key: 'modelNumber',
        label: 'Model Number',
        type: 'text',
        placeholder: 'Enter model number',
      },
      {
        key: 'warrantyExpiryDate',
        label: 'Warranty Expiry Date',
        type: 'date',
      },
      {
        key: 'conditionStatus',
        label: 'Condition Status',
        type: 'select',
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair'],
      },
    ],
  },
  // Financial Assets
  'financial_assets': {
    subCategories: [
      'Cash in Hand',
      'Bank Accounts',
      'Fixed Deposits',
      'Endowment Funds',
      'Investments',
    ],
    fields: [
      {
        key: 'accountNumber',
        label: 'Account Number / Reference',
        type: 'text',
        placeholder: 'Enter account number or reference',
      },
      {
        key: 'bankName',
        label: 'Bank/Institution Name',
        type: 'text',
        placeholder: 'Enter bank or institution name',
      },
      {
        key: 'maturityDate',
        label: 'Maturity Date',
        type: 'date',
      },
      {
        key: 'interestRate',
        label: 'Interest Rate (%)',
        type: 'number',
        placeholder: 'Enter interest rate',
      },
      {
        key: 'principalAmount',
        label: 'Principal Amount',
        type: 'number',
        placeholder: 'Enter principal amount',
      },
    ],
  },
  // Land
  'land': {
    subCategories: [
      'Agricultural Land',
      'Commercial Land',
      'Residential Land',
      'Donated Land',
      'Leased Land',
    ],
    fields: [
      {
        key: 'surveyNumber',
        label: 'Survey Number',
        type: 'text',
        placeholder: 'Enter survey number',
      },
      {
        key: 'landType',
        label: 'Land Type',
        type: 'select',
        options: ['Agricultural', 'Commercial', 'Residential', 'Religious', 'Other'],
      },
      {
        key: 'area',
        label: 'Area',
        type: 'number',
        placeholder: 'Enter area',
      },
      {
        key: 'areaUnit',
        label: 'Area Unit',
        type: 'select',
        options: ['Acres', 'Sq.ft', 'Sq.m'],
      },
      {
        key: 'registrationNumber',
        label: 'Registration Number',
        type: 'text',
        placeholder: 'Enter registration number',
      },
      {
        key: 'registrationDate',
        label: 'Registration Date',
        type: 'date',
      },
      {
        key: 'encumbranceStatus',
        label: 'Encumbrance Status',
        type: 'select',
        options: ['Free', 'Encumbered', 'Under Litigation', 'Other'],
      },
      {
        key: 'landDocument',
        label: 'Land Document',
        type: 'file',
      },
    ],
  },
  // Buildings
  'buildings': {
    subCategories: [
      'Main Temple Building',
      'Mandapam / Hall',
      'Guest House',
      'Priest Quarters',
      'Shops',
      'Office Building',
      'Storage Room',
    ],
    fields: [
      {
        key: 'buildingType',
        label: 'Building Type',
        type: 'select',
        options: ['Temple', 'Mandapam', 'Administrative', 'Residential', 'Commercial', 'Storage', 'Other'],
      },
      {
        key: 'builtUpArea',
        label: 'Built-up Area',
        type: 'number',
        placeholder: 'Enter built-up area',
        unit: 'sq ft',
      },
      {
        key: 'constructionYear',
        label: 'Construction Year',
        type: 'number',
        placeholder: 'e.g., 1990',
      },
      {
        key: 'floorCount',
        label: 'Number of Floors',
        type: 'number',
        placeholder: 'Enter number of floors',
      },
      {
        key: 'approvalNumber',
        label: 'Approval Number',
        type: 'text',
        placeholder: 'Enter approval number',
      },
      {
        key: 'insurancePolicyNumber',
        label: 'Insurance Policy Number',
        type: 'text',
        placeholder: 'Enter insurance policy number',
      },
    ],
  },
  // Infrastructure
  'infrastructure': {
    subCategories: [
      'Compound Wall',
      'Borewell',
      'Water Tank',
      'Electrical Installation',
      'Solar Plant',
      'Drainage System',
      'Parking Area',
    ],
    fields: [
      {
        key: 'infrastructureType',
        label: 'Infrastructure Type',
        type: 'select',
        options: ['Compound Wall', 'Borewell', 'Water Tank', 'Electrical', 'Solar', 'Drainage', 'Parking', 'Other'],
      },
      {
        key: 'capacity',
        label: 'Capacity / Size',
        type: 'text',
        placeholder: 'e.g., 5000L, 100 sq ft',
      },
      {
        key: 'installationDate',
        label: 'Installation Date',
        type: 'date',
      },
      {
        key: 'maintenanceSchedule',
        label: 'Maintenance Schedule',
        type: 'text',
        placeholder: 'e.g., Monthly, Quarterly',
      },
      {
        key: 'lastMaintenanceDate',
        label: 'Last Maintenance Date',
        type: 'date',
      },
    ],
  },
};

/**
 * Get field group for a given sub category
 */
export function getSubCategoryFieldGroup(subCategory: string): SubCategoryFieldGroup | null {
  if (!subCategory) return null;
  
  // Normalize sub category for matching
  const normalized = subCategory.toLowerCase().trim();
  
  // Check each field group
  for (const [key, group] of Object.entries(subCategoryFieldGroups)) {
    if (group.subCategories.some(sc => sc.toLowerCase() === normalized)) {
      return group;
    }
  }
  
  // Fallback matching by keywords
  if (normalized.includes('gold') || normalized.includes('silver') || normalized.includes('precious') || normalized.includes('crown')) {
    return subCategoryFieldGroups.gold_silver_precious;
  }
  if (normalized.includes('idol') || normalized.includes('vessel') || normalized.includes('sacred')) {
    return subCategoryFieldGroups.movable_idols_sacred;
  }
  if (normalized.includes('historical') || normalized.includes('artifact')) {
    return subCategoryFieldGroups.historical_artifacts;
  }
  if (normalized.includes('vehicle') || normalized.includes('car') || normalized.includes('van') || normalized.includes('truck') || normalized.includes('motorcycle')) {
    return subCategoryFieldGroups.vehicles;
  }
  if (normalized.includes('equipment') || normalized.includes('furniture') || normalized.includes('pooja') || normalized.includes('kitchen') || normalized.includes('electrical') || normalized.includes('office') || normalized.includes('sound') || normalized.includes('cctv') || normalized.includes('musical')) {
    return subCategoryFieldGroups.equipment_furniture;
  }
  if (normalized.includes('cash') || normalized.includes('bank') || normalized.includes('deposit') || normalized.includes('endowment') || normalized.includes('investment') || normalized.includes('financial')) {
    return subCategoryFieldGroups.financial_assets;
  }
  if (normalized.includes('land') || normalized.includes('agricultural') || normalized.includes('commercial') || normalized.includes('residential') || normalized.includes('donated') || normalized.includes('leased')) {
    return subCategoryFieldGroups.land;
  }
  if (normalized.includes('building') || normalized.includes('temple') || normalized.includes('mandapam') || normalized.includes('hall') || normalized.includes('guest') || normalized.includes('priest') || normalized.includes('shop') || normalized.includes('office') || normalized.includes('storage')) {
    return subCategoryFieldGroups.buildings;
  }
  if (normalized.includes('infrastructure') || normalized.includes('compound') || normalized.includes('wall') || normalized.includes('borewell') || normalized.includes('water') || normalized.includes('tank') || normalized.includes('electrical') || normalized.includes('solar') || normalized.includes('drainage') || normalized.includes('parking')) {
    return subCategoryFieldGroups.infrastructure;
  }
  
  return null;
}

/**
 * Get all sub categories for a major category
 */
export function getSubCategoriesForMajorCategory(majorCategoryName: string): string[] {
  return majorCategorySubCategories[majorCategoryName] || [];
}

/**
 * Get all sub categories for a field group
 */
export function getSubCategoriesForGroup(groupKey: string): string[] {
  return subCategoryFieldGroups[groupKey]?.subCategories || [];
}
