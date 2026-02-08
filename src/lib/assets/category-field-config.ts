import type { AssetCategory } from '@/types/assets';

export interface CategoryFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file';
  placeholder?: string;
  unit?: string; // e.g., 'grams', 'kg', 'sq ft'
  options?: string[]; // for select fields
  required?: boolean;
}

export interface CategoryConfig {
  category: AssetCategory;
  subCategories: string[];
  fields: CategoryFieldConfig[];
}

export const categoryConfigs: Record<AssetCategory, CategoryConfig> = {
  valuables: {
    category: 'valuables',
    subCategories: ['Jewelry', 'Gold Items', 'Silver Items', 'Precious Stones', 'Cash', 'Other'],
    fields: [
      {
        key: 'weight',
        label: 'Weight',
        type: 'number',
        placeholder: 'Enter weight',
        unit: 'grams',
      },
      {
        key: 'purity',
        label: 'Purity/Karat',
        type: 'text',
        placeholder: 'e.g., 22K, 24K, 999',
      },
      {
        key: 'hallmark',
        label: 'Hallmark',
        type: 'text',
        placeholder: 'Enter hallmark if applicable',
      },
      {
        key: 'dimensions',
        label: 'Dimensions',
        type: 'text',
        placeholder: 'e.g., Length x Width x Height',
      },
      {
        key: 'storageType',
        label: 'Storage Type',
        type: 'select',
        options: ['Vault', 'Locker', 'Safe', 'Other'],
      },
    ],
  },
  vehicles: {
    category: 'vehicles',
    subCategories: ['Car', 'Van', 'Truck', 'Motorcycle', 'Other'],
    fields: [
      {
        key: 'registrationNumber',
        label: 'Registration Number',
        type: 'text',
        placeholder: 'e.g., KA-01-AB-1234',
      },
      {
        key: 'chassisNumber',
        label: 'Chassis Number',
        type: 'text',
        placeholder: 'Enter chassis number',
      },
      {
        key: 'engineNumber',
        label: 'Engine Number',
        type: 'text',
        placeholder: 'Enter engine number',
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
        key: 'fuelType',
        label: 'Fuel Type',
        type: 'select',
        options: ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid', 'Other'],
      },
      {
        key: 'insuranceDetails',
        label: 'Insurance Details',
        type: 'textarea',
        placeholder: 'Enter insurance information',
      },
    ],
  },
  it: {
    category: 'it',
    subCategories: ['Computer', 'Printer', 'Scanner', 'Server', 'Network Equipment', 'Other'],
    fields: [
      {
        key: 'serialNumber',
        label: 'Serial Number',
        type: 'text',
        placeholder: 'Enter serial number',
      },
      {
        key: 'modelNumber',
        label: 'Model Number',
        type: 'text',
        placeholder: 'Enter model number',
      },
      {
        key: 'brandManufacturer',
        label: 'Brand/Manufacturer',
        type: 'text',
        placeholder: 'e.g., Dell, HP, Lenovo',
      },
      {
        key: 'warrantyExpiryDate',
        label: 'Warranty Expiry Date',
        type: 'date',
      },
      {
        key: 'macAddress',
        label: 'MAC Address',
        type: 'text',
        placeholder: 'e.g., 00:1B:44:11:3A:B7',
      },
      {
        key: 'specifications',
        label: 'Specifications',
        type: 'textarea',
        placeholder: 'e.g., RAM: 8GB, Storage: 256GB SSD',
      },
    ],
  },
  immovable: {
    category: 'immovable',
    subCategories: ['Land', 'Building', 'Structure', 'Other'],
    fields: [
      {
        key: 'surveyNumber',
        label: 'Survey Number',
        type: 'text',
        placeholder: 'Enter survey number',
      },
      {
        key: 'propertyTaxId',
        label: 'Property Tax ID',
        type: 'text',
        placeholder: 'Enter property tax ID',
      },
      {
        key: 'area',
        label: 'Area',
        type: 'number',
        placeholder: 'Enter area',
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
        label: 'Floor Count',
        type: 'number',
        placeholder: 'Number of floors',
      },
    ],
  },
  sacred: {
    category: 'sacred',
    subCategories: ['Deity Idols', 'Religious Artifacts', 'Sacred Texts', 'Ritual Items', 'Other'],
    fields: [
      {
        key: 'deityName',
        label: 'Deity Name',
        type: 'text',
        placeholder: 'Enter deity name if idol',
      },
      {
        key: 'material',
        label: 'Material',
        type: 'select',
        options: ['Stone', 'Metal', 'Wood', 'Marble', 'Brass', 'Silver', 'Gold', 'Other'],
      },
      {
        key: 'ageHistoricalPeriod',
        label: 'Age/Historical Period',
        type: 'text',
        placeholder: 'e.g., 1950, Ancient, Medieval',
      },
      {
        key: 'ritualSignificance',
        label: 'Ritual Significance',
        type: 'textarea',
        placeholder: 'Describe ritual significance',
      },
      {
        key: 'specialCareInstructions',
        label: 'Special Care Instructions',
        type: 'textarea',
        placeholder: 'Enter special care instructions',
      },
    ],
  },
  operational: {
    category: 'operational',
    subCategories: ['Kitchen Equipment', 'Furniture', 'Office Equipment', 'Maintenance Tools', 'Other'],
    fields: [
      {
        key: 'serialNumber',
        label: 'Serial Number',
        type: 'text',
        placeholder: 'Enter serial number if applicable',
      },
      {
        key: 'brandManufacturer',
        label: 'Brand/Manufacturer',
        type: 'text',
        placeholder: 'Enter brand or manufacturer',
      },
      {
        key: 'modelNumber',
        label: 'Model Number',
        type: 'text',
        placeholder: 'Enter model number',
      },
      {
        key: 'capacitySize',
        label: 'Capacity/Size',
        type: 'text',
        placeholder: 'e.g., 50L, 6ft x 3ft',
      },
      {
        key: 'lastServiceDate',
        label: 'Last Service Date',
        type: 'date',
      },
    ],
  },
};

export function getCategoryConfig(category: AssetCategory): CategoryConfig {
  return categoryConfigs[category] || categoryConfigs.operational;
}

export function getSubCategories(category: AssetCategory): string[] {
  return getCategoryConfig(category).subCategories;
}

export function getCategoryFields(category: AssetCategory): CategoryFieldConfig[] {
  return getCategoryConfig(category).fields;
}
