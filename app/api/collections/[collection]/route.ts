import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { Query } from 'firebase-admin/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const orderBy = searchParams.get('orderBy');
    const orderDirection = searchParams.get('orderDirection') as 'asc' | 'desc' || 'asc';

    let query: Query = db.collection(collection).limit(limit);

    if (orderBy) {
      query = query.orderBy(orderBy, orderDirection);
    }

    const snapshot = await query.get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await params;
    const data = await request.json();

    // Add timestamps
    const docData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(collection).add(docData);
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
