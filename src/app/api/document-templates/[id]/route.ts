import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/server-auth';
import connectToDatabase from '@/lib/mongodb';
import { DocumentTemplateModel } from '@/models/document-template';
import { UpdateDocumentTemplateDto } from '@/types/document-template';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
    const { id } = await context.params;
    console.log('Looking for template:', { id, customerId: auth.customerId });

    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);
    
    const template = await DocumentTemplateModel.findOne({
      _id: objectId,
      customerId: auth.customerId,
    });

    if (!template) {
      console.log('Template not found');
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    console.log('Found template:', template);
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching document template:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    console.log('Auth from request:', auth); // Debug log
    
    if (!auth.customerId) {
      console.log('No customerId found in request'); // Debug log
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as UpdateDocumentTemplateDto;
    console.log('Received update data:', body); // Debug log

    await connectToDatabase();

    const { id } = await context.params;
    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    // Ensure arrays are initialized
    const updateData = {
      ...body,
      objectFields: body.objectFields || [],
      contactFields: body.contactFields || [],
      lineItemFields: body.lineItemFields || [],
    };

    console.log('Updating template with data:', updateData); // Debug log

    const template = await DocumentTemplateModel.findOneAndUpdate(
      {
        _id: objectId,
        customerId: auth.customerId,
      },
      { $set: updateData },
      { new: true }
    );

    if (!template) {
      console.log('Template not found for update');
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    console.log('Updated template:', template);
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating document template:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await context.params;
    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    const template = await DocumentTemplateModel.findOneAndDelete({
      _id: objectId,
      customerId: auth.customerId,
    });

    if (!template) {
      console.log('Template not found for deletion');
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    console.log('Deleted template:', template);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document template:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 