export type CustomFieldType = 'text' | 'dropdown' | 'radio' | 'other';

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: CustomFieldType;
  options?: string[]; // for dropdown/radio
}

