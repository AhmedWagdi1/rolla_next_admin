import { NextRequest, NextResponse } from 'next/server';
import { getBucket } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const bucket = getBucket();
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${path}/${timestamp}_${originalName}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Storage
    const fileRef = bucket.file(fileName);
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make file public and get URL
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
