import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    const { property_type, finishing_type, ...rest } = data;

    const docData: Record<string, unknown> = {
      ...rest,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (property_type) {
      docData.property_type = db.collection('property_types').doc(property_type);
    } else {
      docData.property_type = FieldValue.delete();
    }

    if (finishing_type) {
      docData.finishing_type = db.collection('finishing_types').doc(finishing_type);
    } else {
      docData.finishing_type = FieldValue.delete();
    }

    await db.collection('projects').doc(id).update(docData);
    const doc = await db.collection('projects').doc(id).get();

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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await db.collection('projects').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
