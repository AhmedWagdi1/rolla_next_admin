import * as admin from 'firebase-admin';
import serviceAccount from '../firebase-credentials.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: 'rolla-q4037s.appspot.com',
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
