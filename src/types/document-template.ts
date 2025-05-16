export type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';

export interface DocumentTemplateField {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  options: string[];
  defaultValue: string;
  validation: 'none' | 'email' | 'phone' | 'date' | 'number' | 'url';
  placeholder?: string;
  description?: string;
}

export interface DocumentTemplate {
  _id?: string;
  name: string;
  description: string;
  connectionId?: string; // ID of the connected integration
  objectFields: DocumentTemplateField[];
  contactFields: DocumentTemplateField[];
  lineItemFields: DocumentTemplateField[];
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDocumentTemplateDto = Omit<DocumentTemplate, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateDocumentTemplateDto = Partial<CreateDocumentTemplateDto>; 