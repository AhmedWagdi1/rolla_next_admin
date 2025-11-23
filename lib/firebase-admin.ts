import * as admin from 'firebase-admin';
import credentials from '../firebase-credentials.json';

// Only initialize once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.trim() || 'rolla-q4037s.appspot.com',
    });
  } catch (e) {
    console.error('[firebase-admin] Initialization error:', e);
    throw new Error('Firebase Admin SDK initialization failed.');
  }
}

export const db = admin.firestore();
export const adminAuth = admin.auth();
export const storage = admin.storage();

// Get bucket lazily to avoid initialization errors
export function getBucket() {
  return storage.bucket();
}

export default admin;

