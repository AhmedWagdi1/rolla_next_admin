import { NextRequest, NextResponse } from 'next/server';
import { db, adminAuth } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await db.collection('users').doc(id).get();

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Get existing document to find the Firebase Auth UID
    const existingDoc = await db.collection('users').doc(id).get();
    if (!existingDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const existingData = existingDoc.data();
    const authUid = existingData?.uid;

    // Update Firebase Auth user if we have the UID
    if (authUid) {
      try {
        const authUpdateData: {
          email?: string;
          displayName?: string;
          photoURL?: string;
          password?: string;
        } = {};

        if (data.email && data.email !== existingData?.email) {
          authUpdateData.email = data.email;
        }

        if (data.display_name || data.displayName) {
          authUpdateData.displayName = data.display_name || data.displayName;
        }

        if (data.photoURL || data.company_logo) {
          authUpdateData.photoURL = data.photoURL || data.company_logo;
        }

        // Allow password update if provided
        if (data.password) {
          authUpdateData.password = data.password;
        }

        // Only update if there are changes
        if (Object.keys(authUpdateData).length > 0) {
          await adminAuth.updateUser(authUid, authUpdateData);
        }
      } catch (authError) {
        console.error('Error updating auth user:', authError);
        // Continue with Firestore update even if auth update fails
      }
    }

    // Don't allow updating certain protected fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, created_time, uid, ...updateData } = data;

    // Add updatedAt timestamp
    const firestoreData = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Update Firestore document
    await db.collection('users').doc(id).update(firestoreData);
    const doc = await db.collection('users').doc(id).get();

    return NextResponse.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
      message: 'User updated in both Firebase Auth and Firestore'
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the document to find the Firebase Auth UID
    const doc = await db.collection('users').doc(id).get();
    if (doc.exists) {
      const data = doc.data();
      const authUid = data?.uid;

      // Delete from Firebase Auth if UID exists
      if (authUid) {
        try {
          await adminAuth.deleteUser(authUid);
        } catch (authError) {
          console.error('Error deleting auth user:', authError);
          // Continue with Firestore deletion even if auth deletion fails
        }
      }
    }

    // Delete from Firestore
    await db.collection('users').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'User deleted from both Firebase Auth and Firestore',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
