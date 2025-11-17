import { NextRequest, NextResponse } from 'next/server';
import { db, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    const snapshot = await db.collection('users').limit(limit).get();
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create Firebase Auth user first
    let authUser;
    try {
      const authUserData: {
        email: string;
        displayName?: string;
        photoURL?: string;
        password?: string;
      } = {
        email: data.email,
      };

      if (data.display_name || data.displayName) {
        authUserData.displayName = data.display_name || data.displayName;
      }

      if (data.photoURL || data.company_logo) {
        authUserData.photoURL = data.photoURL || data.company_logo;
      }

      // Set a default password or require it in the request
      authUserData.password = data.password || `TempPass${Date.now()}!`;

      authUser = await adminAuth.createUser(authUserData);
    } catch (authError) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to create authentication user: ${authError instanceof Error ? authError.message : 'Unknown error'}` 
        },
        { status: 500 }
      );
    }

    // Prepare Firestore document data
    const docData: Record<string, unknown> = {
      uid: authUser.uid,
      email: data.email,
      displayName: data.display_name || data.displayName || '',
      is_supplier: data.is_supplier || false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      emailVerified: false,
      phoneNumber: authUser.phoneNumber || null,
      photoURL: data.photoURL || data.company_logo || null,
      providerId: 'firebase',
      isAnonymous: false,
      metadata: {
        creationTime: authUser.metadata.creationTime,
        lastSignInTime: authUser.metadata.lastSignInTime,
      },
    };

    // Add supplier-specific fields if applicable
    if (data.is_supplier) {
      docData.company_name = data.company_name || '';
      docData.company_logo = data.company_logo || '';
    }

    // Add other fields from the request
    if (data.firstName) docData.firstName = data.firstName;
    if (data.lastName) docData.lastName = data.lastName;
    if (data.fullName) docData.fullName = data.fullName;

    // Create Firestore document
    const docRef = await db.collection('users').add(docData);
    const doc = await docRef.get();

    return NextResponse.json({
      success: true,
      data: { 
        id: doc.id, 
        ...doc.data(),
        authUid: authUser.uid,
        message: 'User created in both Firebase Auth and Firestore'
      },
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
