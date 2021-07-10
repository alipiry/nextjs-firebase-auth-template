import firebase from 'firebase/app';

// @Docs: https://firebase.google.com/docs/web/setup?sdk_version=v8
//
// These credentials are OK to be exposed, but you can replace them with environment variables.
// Read the full thread here:
// https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public/37484053#37484053
export const cfg = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};
if (!firebase.apps.length) firebase.initializeApp(cfg);

function initAuth() {
  const auth = firebase.auth();
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (emulatorHost) auth.useEmulator(emulatorHost);
  return auth;
}
export const auth = initAuth();
