import mongoose, { Schema } from 'mongoose';
import { Document } from '@/types/document';

const documentSchema = new Schema<Document>({
  name: { type: String, required: true },
  templateId: { type: String, required: true },
  objectVariables: { type: Schema.Types.Mixed, required: true },
  contactVariables: { type: Schema.Types.Mixed, required: true },
  lineItemVariables: [{ type: Schema.Types.Mixed }],
  customerId: { type: String, required: true },
  createdAt: { type: Schema.Types.Date, default: Date.now },
  updatedAt: { type: Schema.Types.Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
documentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const DocumentModel = mongoose.models.Document || mongoose.model<Document>('Document', documentSchema); 