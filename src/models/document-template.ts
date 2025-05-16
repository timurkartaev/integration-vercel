import mongoose from 'mongoose';
import { DocumentTemplate, DocumentTemplateField } from '@/types/document-template';

const documentTemplateFieldSchema = new mongoose.Schema<DocumentTemplateField>({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'number', 'date', 'select', 'checkbox', 'textarea'],
    required: true,
    default: 'text'
  },
  required: { type: Boolean, default: false },
  options: { type: [String], default: [] },
  defaultValue: { type: mongoose.Schema.Types.Mixed, default: '' },
  validation: {
    type: String,
    enum: ['none', 'email', 'phone', 'date', 'number', 'url'],
    default: 'none'
  },
  placeholder: { type: String, default: '' },
  description: { type: String, default: '' }
});

const documentTemplateSchema = new mongoose.Schema<DocumentTemplate>(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    connectionId: { type: String, required: false },
    objectFields: { type: [documentTemplateFieldSchema], default: [] },
    contactFields: { type: [documentTemplateFieldSchema], default: [] },
    lineItemFields: { type: [documentTemplateFieldSchema], default: [] },
    customerId: { type: String, required: true },
  },
  {
    timestamps: true,
    strict: true // This ensures only defined fields are saved
  }
);

// Add a pre-save hook to ensure arrays are initialized
documentTemplateSchema.pre('save', function(next) {
  if (!this.objectFields) this.objectFields = [];
  if (!this.contactFields) this.contactFields = [];
  if (!this.lineItemFields) this.lineItemFields = [];
  next();
});

// Remove any existing model to ensure clean schema
if (mongoose.models.DocumentTemplate) {
  delete mongoose.models.DocumentTemplate;
}

export const DocumentTemplateModel = mongoose.model<DocumentTemplate>('DocumentTemplate', documentTemplateSchema); 