import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

import { auth, Logger } from '@lib';
import { API_LOGIN_PATH, API_LOGOUT_PATH } from '@lib/common';

const logger = new Logger('AuthContext');

export interface IAuthContext {
  firebaseUser: firebase.User | null;
  signOut(): Promise<void>;
}

export const AuthContext = React.createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider: React.FC = ({ children }) => {
  const [loading, setLoading] = React.useState(true);
  const [firebaseUser, setFirebaseUser] = React.useState<firebase.User | null>(null);
  const [idToken, setIdToken] = React.useState('');

  const reset = React.useCallback(() => {
    setIdToken('');
    setFirebaseUser(null);
    setLoading(false);
  }, [setIdToken, setFirebaseUser, setLoading]);

  const mergeSetIdToken = React.useCallback(
    (idToken: string) => {
      setIdToken(idToken);
      // Add any further setters.
      // I typically use a global HTTP client which works in both the browser and NodeJS
      // runtime.
    },
    [setIdToken]
  );

  React.useEffect(() => {
    const loggerPrefix = 'onIdTokenChanged:';
    const unsubscribe = auth.onIdTokenChanged(
      async (user) => {
        // Debug statement. Won't run in production.
        logger.debug(loggerPrefix, user);

        // Update local state.
        setLoading(true);
        setFirebaseUser(user);

        // If a user is logged-in:
        //  1. Fetch the user's idToken.
        //  2. Set sever-only cookie which will enable SSR.
        if (user) {
          try {
            const idToken = await user.getIdToken();
            mergeSetIdToken(idToken);
            await fetch(API_LOGIN_PATH, getRequestOptions(`${idToken}+${user.refreshToken}`));
          } catch (err) {
            reset();
            logger.error('Cookie.set: %s', err);
          }
        } else {
          reset();
        }

        // Render children.
        setLoading(false);
      },
      (err) => {
        reset();
        logger.error(loggerPrefix, err.message);
      }
    );
    return () => unsubscribe();
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      // Remove existing cookies.
      await fetch(API_LOGOUT_PATH, getRequestOptions(idToken));
      // Sign out from Firebase.
      await auth.signOut();
    } catch (err) {
      reset();
      logger.error('signOut: %s', err.message);
    }
  }, [idToken, auth.signOut]);

  const value = React.useMemo<IAuthContext>(
    () => ({ firebaseUser, signOut }),
    [firebaseUser, signOut]
  );
  return loading ? (
    // Custom your loading page/state.
    <p>Loading...</p>
  ) : (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

function getRequestOptions(idToken: string): RequestInit {
  return {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Authorization: idToken,
    },
  };
}
