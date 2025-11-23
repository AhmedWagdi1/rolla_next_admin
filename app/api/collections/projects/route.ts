import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const snapshot = await db.collection('projects').get();
    const documents = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      let propertyTypeData = null;
      if (data.property_type && typeof data.property_type.get === 'function') {
        const propertyTypeDoc = await data.property_type.get();
        if (propertyTypeDoc.exists) {
          propertyTypeData = { id: propertyTypeDoc.id, ...propertyTypeDoc.data() };
        }
      }
      let finishingTypeData = null;
      if (data.finishing_type && typeof data.finishing_type.get === 'function') {
        const finishingTypeDoc = await data.finishing_type.get();
        if (finishingTypeDoc.exists) {
          finishingTypeData = { id: finishingTypeDoc.id, ...finishingTypeDoc.data() };
        }
      }
      return {
        id: doc.id,
        ...data,
        property_type: propertyTypeData,
        finishing_type: finishingTypeData,
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
    const { property_type, finishing_type, ...rest } = data;

    const docData: Record<string, unknown> = {
      ...rest,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (property_type) {
      docData.property_type = db.collection('property_types').doc(property_type);
    }
    if (finishing_type) {
      docData.finishing_type = db.collection('finishing_types').doc(finishing_type);
    }

    const docRef = await db.collection('projects').add(docData);
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
