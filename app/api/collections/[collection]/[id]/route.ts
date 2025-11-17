import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const doc = await db.collection(collection).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    const data = await request.json();

    // Update timestamps
    const docData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await db.collection(collection).doc(id).update(docData);
    const doc = await db.collection(collection).doc(id).get();

    return NextResponse.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const { collection, id } = await params;
    await db.collection(collection).doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
