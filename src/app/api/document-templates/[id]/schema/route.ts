import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { DocumentTemplateModel } from '@/models/document-template';
import { DocumentTemplateField } from '@/types/document-template';
import mongoose from 'mongoose';

interface JsonSchemaField {
  type: string;
  title: string;
  description?: string;
  enum?: string[];
  format?: string;
  minLength?: number;
  default?: string | number | boolean;
}

interface JsonSchemaObject {
  type: 'object';
  title: string;
  properties: Record<string, JsonSchemaField>;
  required: string[];
}

interface JsonSchema {
  $schema: string;
  type: 'object';
  title: string;
  description?: string;
  properties: {
    objectFields: JsonSchemaObject;
    contactFields: JsonSchemaObject;
    lineItemFields: JsonSchemaObject;
  };
  required: string[];
}

function getJsonSchemaType(fieldType: string): string {
  switch (fieldType) {
    case 'text':
    case 'textarea':
      return 'string';
    case 'number':
      return 'number';
    case 'date':
      return 'string';
    case 'checkbox':
      return 'boolean';
    case 'select':
      return 'string';
    default:
      return 'string';
  }
}

function getJsonSchemaFormat(fieldType: string): string | undefined {
  switch (fieldType) {
    case 'date':
      return 'date-time';
    case 'email':
      return 'email';
    case 'phone':
      return 'phone';
    case 'url':
      return 'uri';
    default:
      return undefined;
  }
}

function createFieldSchema(field: DocumentTemplateField): JsonSchemaField {
  const schema: JsonSchemaField = {
    type: getJsonSchemaType(field.type),
    title: field.name,
    description: field.description,
  };

  if (field.type === 'select' && field.options?.length > 0) {
    schema.enum = field.options;
  }

  if (field.validation) {
    const format = getJsonSchemaFormat(field.validation);
    if (format) {
      schema.format = format;
    }
  }

  if (field.required) {
    schema.minLength = 1;
  }

  if (field.defaultValue !== undefined) {
    schema.default = field.defaultValue;
  }

  return schema;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);
    
    const template = await DocumentTemplateModel.findOne({
      _id: objectId,
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Create JSON Schema
    const jsonSchema: JsonSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: template.name,
      description: template.description,
      properties: {
        objectFields: {
          type: 'object',
          title: 'Object Fields',
          properties: template.objectFields.reduce((acc: Record<string, JsonSchemaField>, field: DocumentTemplateField) => {
            acc[field.name] = createFieldSchema(field);
            return acc;
          }, {}),
          required: template.objectFields
            .filter((field: DocumentTemplateField) => field.required)
            .map((field: DocumentTemplateField) => field.name),
        },
        contactFields: {
          type: 'object',
          title: 'Contact Fields',
          properties: template.contactFields.reduce((acc: Record<string, JsonSchemaField>, field: DocumentTemplateField) => {
            acc[field.name] = createFieldSchema(field);
            return acc;
          }, {}),
          required: template.contactFields
            .filter((field: DocumentTemplateField) => field.required)
            .map((field: DocumentTemplateField) => field.name),
        },
        lineItemFields: {
          type: 'object',
          title: 'Line Item Fields',
          properties: template.lineItemFields.reduce((acc: Record<string, JsonSchemaField>, field: DocumentTemplateField) => {
            acc[field.name] = createFieldSchema(field);
            return acc;
          }, {}),
          required: template.lineItemFields
            .filter((field: DocumentTemplateField) => field.required)
            .map((field: DocumentTemplateField) => field.name),
        },  
      },
      required: ['objectFields', 'contactFields', 'lineItemFields'],
    };

    return NextResponse.json(jsonSchema);
  } catch (error) {
    console.error('Error fetching document template schema:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 