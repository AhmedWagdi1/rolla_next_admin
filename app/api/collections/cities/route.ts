import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const snapshot = await db.collection('cities').get();
    const documents = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      let goverData = null;
      if (data.gover && typeof data.gover.get === 'function') {
        const goverDoc = await data.gover.get();
        if (goverDoc.exists) {
          goverData = { id: goverDoc.id, ...goverDoc.data() };
        }
      }
      return {
        id: doc.id,
        ...data,
        gover: goverData,
      };
    }));

    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { gover, ...rest } = data;

    const docData: Record<string, unknown> = {
      ...rest,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (gover) {
      docData.gover = db.collection('governorates').doc(gover);
    }

    const docRef = await db.collection('cities').add(docData);
    const doc = await docRef.get();

    return NextResponse.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
