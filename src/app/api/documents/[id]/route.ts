import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/server-auth';
import connectToDatabase from '@/lib/mongodb';
import { DocumentModel } from '@/models/document';
import { UpdateDocumentDto } from '@/types/document';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth.customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id } = await context.params;
    
    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);
    
    const document = await DocumentModel.findOne({
      _id: objectId,
      customerId: auth.customerId,
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
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
    if (!auth.customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as UpdateDocumentDto;
    await connectToDatabase();

    const { id } = await context.params;
    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    const document = await DocumentModel.findOneAndUpdate(
      {
        _id: objectId,
        customerId: auth.customerId,
      },
      { $set: body },
      { new: true }
    );

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
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
    if (!auth.customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = await context.params;
    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    const document = await DocumentModel.findOneAndDelete({
      _id: objectId,
      customerId: auth.customerId,
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 