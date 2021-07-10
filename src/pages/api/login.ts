import { NextApiRequest, NextApiResponse } from 'next';

import { Logger } from '@lib';
import { firebaseAdminSDK } from '@lib/firebase.admin';
import { AuthCookie } from '@lib/AuthCookie';

const auth = firebaseAdminSDK.auth();
const logger = new Logger('api/login');

// This handler stores the user's idToken as well as the accompanying refresh
// token inside a cookie. Said cookie will be used to perform SSR operations
// throughout the application.
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  // Precaution, but should never be hit.
  if (!authHeader) return res.status(400);

  try {
    const [idToken, refreshToken] = authHeader.split('+');
    await auth.verifyIdToken(idToken);
    const cookie = new AuthCookie(req, res);

    // The token was refreshed on the client-side. Update the cookie to
    // reflect the change.
    if (cookie.get().idToken != idToken) {
      logger.info('setting cookies');
      cookie.set({ idToken, refreshToken });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unexpected error' });
  }

  return res.status(200).json({ status: true });
}

export default handler;
