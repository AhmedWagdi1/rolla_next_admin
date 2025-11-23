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
    const { gover, ...rest } = data;

    const docData: Record<string, unknown> = {
      ...rest,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (gover && typeof gover === 'string' && gover.trim() !== '') {
      docData.gover = db.collection('governorates').doc(gover);
    } else {
      docData.gover = FieldValue.delete();
    }

    await db.collection('cities').doc(id).update(docData);
    const doc = await db.collection('cities').doc(id).get();

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
    await db.collection('cities').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
