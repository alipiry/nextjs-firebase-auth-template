import React from 'react';
import { useRouter } from 'next/router';

import { auth } from '@lib';
import { useExampleProps } from '@lib/useSSR';
import { LOGIN_PATH } from '@lib/common';
import { useAuth } from '@hooks';

export default function Index() {
  const { firebaseUser, signOut } = useAuth();
  const router = useRouter();

  const onClick = React.useCallback(() => {
    signOut()
      .then(async () => await router.push(LOGIN_PATH))
      .catch((err) => console.error(err));
  }, [auth]);

  return (
    <div>
      <h1>Welcome {firebaseUser?.displayName}</h1>
      <button onClick={onClick}>Log out</button>
    </div>
  );
}

export const getServerSideProps = useExampleProps();
