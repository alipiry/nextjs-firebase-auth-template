import * as admin from 'firebase-admin';

function getConfig() {
  if (process.env.NODE_ENV == 'development')
    return {
      credential: admin.credential.cert(require('../../keys/firebase-admin.json')),
    };

  return {
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    }),
  };
}

function initApp() {
  if (!admin.apps.length) {
    admin.initializeApp({ ...getConfig(), databaseURL: '' });
  }
  return admin;
}

export const firebaseAdminSDK = initApp();
