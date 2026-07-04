import * as admin from 'firebase-admin';

let firebaseAdminReady = false;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    const cleaned = raw.trim().replace(/^["']|["']$/g, '');
    const serviceAccount = JSON.parse(cleaned);
    admin.initializeApp({
      credential: (admin as any).credential.cert(serviceAccount),
    });
    firebaseAdminReady = true;
    console.log('[Firebase] Admin SDK initialized successfully.');
  } catch (err) {
    console.error('[Firebase] Failed to parse/initialize with SERVICE_ACCOUNT credentials:', err);
    console.error('[Firebase] Will fall back to local JWT decode (unverified) for auth.');
  }
} else {
  console.log('[Firebase] Running in DEV/MOCK authentication mode. Set FIREBASE_SERVICE_ACCOUNT to enable token verification.');
}

export { admin, firebaseAdminReady };
