import { NextApiRequest, NextApiResponse } from 'next';

import { Logger } from '@lib';
import { firebaseAdminSDK } from '@lib/firebase.admin';
import { AuthCookie } from '@lib/AuthCookie';

const logger = new Logger('api/logout');
const auth = firebaseAdminSDK.auth();

// This handler overrides the auth cookie with an empty value.
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const idToken = req.headers.authorization;
  // Precaution, but should never be hit.
  if (!idToken) return res.status(400).json({ error: 'Unauthenticated' });

  try {
    await auth.verifyIdToken(idToken);
    // Override the cookie by setting its value to 'undefined'.
    new AuthCookie(req, res).delete();
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ error: 'Unexpected error' });
  }

  return res.status(200).json({ success: true });
}

export default handler;
