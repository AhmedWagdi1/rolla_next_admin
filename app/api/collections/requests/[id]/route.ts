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
    const { client, acceptedProposal, acceptedSupplier, ...rest } = data;

    const docData: Record<string, unknown> = {
      ...rest,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (client) {
      docData.client = db.collection('users').doc(client);
    } else {
      docData.client = FieldValue.delete();
    }

    if (acceptedProposal) {
      docData.acceptedProposal = db.collection('proposals').doc(acceptedProposal);
    } else {
      docData.acceptedProposal = FieldValue.delete();
    }

    if (acceptedSupplier) {
      docData.acceptedSupplier = db.collection('users').doc(acceptedSupplier);
    } else {
      docData.acceptedSupplier = FieldValue.delete();
    }

    await db.collection('requests').doc(id).update(docData);
    const doc = await db.collection('requests').doc(id).get();

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
    await db.collection('requests').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
