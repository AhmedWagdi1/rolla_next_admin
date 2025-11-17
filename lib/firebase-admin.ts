import * as admin from 'firebase-admin';

// Read service account fields from environment variables
// Note: FIREBASE_PRIVATE_KEY should have newlines escaped ("\\n"); we unescape below
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 'rolla-q4037s.appspot.com';

if (!admin.apps.length) {
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin env vars. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket,
  });
}

export const db = admin.firestore();
export const adminAuth = admin.auth();
export const storage = admin.storage();

// Get bucket lazily to avoid initialization errors
export function getBucket() {
  return storage.bucket();
}

export default admin;
