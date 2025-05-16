export interface Document {
  _id?: string;
  name: string;
  templateId: string;
  objectVariables: Record<string, string | number | boolean>;
  contactVariables: Record<string, string | number | boolean>;
  lineItemVariables: Record<string, string | number | boolean>[];
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateDocumentDto = Omit<Document, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateDocumentDto = Partial<CreateDocumentDto>; 