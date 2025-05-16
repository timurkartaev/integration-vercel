import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/server-auth';
import connectToDatabase from '@/lib/mongodb';
import { DocumentTemplateModel } from '@/models/document-template';
import { DocumentTemplateField } from '@/types/document-template';

export async function GET(request: NextRequest) {
  try {
    console.log('Request headers:', Object.fromEntries(request.headers.entries())); // Debug log
    
    const auth = getAuthFromRequest(request);
    console.log('Auth from request:', auth); // Debug log
    
    if (!auth.customerId) {
      console.log('No customerId found in request'); // Debug log
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const templates = await DocumentTemplateModel.find({ customerId: auth.customerId })
      .sort({ createdAt: -1 });

    console.log('Found templates:', templates); // Debug log
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching document templates:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth.customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Raw request body:', body);
    console.log('Object fields:', body.objectFields);
    console.log('Contact fields:', body.contactFields);
    console.log('Line item fields:', body.lineItemFields);

    await connectToDatabase();

    // Ensure arrays are initialized and all required fields are present
    const templateData = {
      ...body,
      customerId: auth.customerId,
      objectFields: (body.objectFields || []).map((field: Partial<DocumentTemplateField>) => ({
        name: field.name || '',
        type: field.type || 'text',
        required: field.required || false,
        options: field.options || [],
        defaultValue: field.defaultValue || '',
        validation: field.validation || 'none',
        placeholder: field.placeholder || '',
        description: field.description || '',
      })),
      contactFields: (body.contactFields || []).map((field: Partial<DocumentTemplateField>) => ({
        name: field.name || '',
        type: field.type || 'text',
        required: field.required || false,
        options: field.options || [],
        defaultValue: field.defaultValue || '',
        validation: field.validation || 'none',
        placeholder: field.placeholder || '',
        description: field.description || '',
      })),
      lineItemFields: (body.lineItemFields || []).map((field: Partial<DocumentTemplateField>) => ({
        name: field.name || '',
        type: field.type || 'text',
        required: field.required || false,
        options: field.options || [],
        defaultValue: field.defaultValue || '',
        validation: field.validation || 'none',
        placeholder: field.placeholder || '',
        description: field.description || '',
      })),
    };

    console.log('Processed template data:', templateData);
    console.log('Object fields after processing:', templateData.objectFields);
    console.log('Contact fields after processing:', templateData.contactFields);
    console.log('Line item fields after processing:', templateData.lineItemFields);

    const template = await DocumentTemplateModel.create(templateData);
    console.log('Created template:', template);

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating document template:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 