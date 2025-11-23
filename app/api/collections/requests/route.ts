import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const snapshot = await db.collection('requests').get();
    const documents = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      let clientData = null;
      if (data.client && typeof data.client.get === 'function') {
        const clientDoc = await data.client.get();
        if (clientDoc.exists) {
          clientData = { id: clientDoc.id, ...clientDoc.data() };
        }
      }
      let acceptedProposalData = null;
      if (data.acceptedProposal && typeof data.acceptedProposal.get === 'function') {
        const acceptedProposalDoc = await data.acceptedProposal.get();
        if (acceptedProposalDoc.exists) {
          acceptedProposalData = { id: acceptedProposalDoc.id, ...acceptedProposalDoc.data() };
        }
      }
      let acceptedSupplierData = null;
      if (data.acceptedSupplier && typeof data.acceptedSupplier.get === 'function') {
        const acceptedSupplierDoc = await data.acceptedSupplier.get();
        if (acceptedSupplierDoc.exists) {
          acceptedSupplierData = { id: acceptedSupplierDoc.id, ...acceptedSupplierDoc.data() };
        }
      }
      return {
        id: doc.id,
        ...data,
        client: clientData,
        acceptedProposal: acceptedProposalData,
        acceptedSupplier: acceptedSupplierData,
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
    const { client, acceptedProposal, acceptedSupplier, ...rest } = data;

    const docData: Record<string, unknown> = {
      ...rest,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (client) {
      docData.client = db.collection('users').doc(client);
    }
    if (acceptedProposal) {
      docData.acceptedProposal = db.collection('proposals').doc(acceptedProposal);
    }
    if (acceptedSupplier) {
      docData.acceptedSupplier = db.collection('users').doc(acceptedSupplier);
    }

    const docRef = await db.collection('requests').add(docData);
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
