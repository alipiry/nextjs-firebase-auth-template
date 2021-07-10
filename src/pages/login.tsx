import React from 'react';
import 'firebase/auth';

import { auth } from '@lib';
import { useSSR } from '@lib/useSSR';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();

  // Implement your login callback.
  const onClick = React.useCallback(() => {
    auth
      .signInWithEmailAndPassword('test@test.com', 'password123')
      .then(async () => await router.push('/'))
      .catch((err) => console.error(err));
  }, [auth]);

  return (
    <div>
      <button onClick={onClick}>Login</button>
    </div>
  );
}

export const getServerSideProps = useSSR(async (ctx, idToken) => {
  if (idToken)
    return {
      redirect: {
        statusCode: 301,
        destination: '/',
      },
      props: {} as never,
    };

  return { props: {} };
});
