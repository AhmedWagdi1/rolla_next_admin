import * as admin from 'firebase-admin';

// Read service account fields from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// Handle private key: Vercel may provide it with literal \n or actual newlines
// Replace literal backslash-n with actual newlines, then normalize any existing newlines
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY || '';
const privateKey = privateKeyRaw.includes('\\n') 
  ? privateKeyRaw.replace(/\\n/g, '\n')
  : privateKeyRaw;
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
