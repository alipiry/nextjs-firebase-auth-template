import { GetServerSidePropsContext } from 'next';

import { Logger, sleep } from '@lib';
import { AuthCookie, IAuthCookieContent } from '@lib/AuthCookie';
import { firebaseAdminSDK } from '@lib/firebase.admin';

const auth = firebaseAdminSDK.auth();
const logger = new Logger('useSSR');

export type Context = GetServerSidePropsContext;
export type Callback = (ctx: Context, idToken: string) => Promise<any>;

export function useSSR(callback: Callback): (ctx: Context) => void {
  return async (ctx: Context) => {
    let result = new AuthCookie(ctx.req, ctx.res).get();
    if (!result.idToken) return { ...(await callback(ctx, '')) };

    try {
      await auth.verifyIdToken(result.idToken);
    } catch (err) {
      // Token has expired; refresh it so that the SSR call can continue
      // uninterrupted.
      //
      // (MZ): Unfortunately, I haven't a found way to persist the idToken
      // on the client. The token will always be refreshed (again) once the
      // page loads the firebase client. Realistically, the need for the token
      // to be refreshed sever-side will be rare, and so the overhead could be
      // ignored.
      if (err.code === 'auth/id-token-expired') {
        result = await refreshIdToken(result.refreshToken);
      } else {
        return {
          redirect: {
            statusCode: 301,
            destination: '/TODO', // Place your internal server error page.
          },
          props: {} as never,
        };
      }
    }

    return { ...(await callback(ctx, result.idToken)) };
  };
}

async function refreshIdToken(token: string): Promise<IAuthCookieContent> {
  // I know how this looks, but this key is not a security token per-say:
  // https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public/37484053#37484053
  const API_KEY = 'YOUR API KEY';
  const scheme = process.env.FIREBASE_AUTH_EMULATOR_HOST
    ? 'http://' + process.env.FIREBASE_AUTH_EMULATOR_HOST
    : 'https:/';
  const URL = `${scheme}/securetoken.googleapis.com/v1/token?key=${API_KEY}`;

  let sleepFor = 5;
  while (true) {
    const res = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=refresh_token&refresh_token=${token}`,
    });
    // Keep trying until request succeeds.
    const data = await res.json();
    if (!res.ok) {
      logger.info('failed to refresh token:', data);
      await sleep(sleepFor);
      sleepFor *= 1.5;
      continue;
    }

    const { id_token: idToken, refresh_token: refreshToken } = data;
    return {
      idToken,
      refreshToken,
    };
  }
}
