# nextjs-firebase-auth-template

This template handles both client-side and server-side authentication. This enables the use of 
SSR through Firebase tokens.

## Table of Contents

- [Getting Started](#getting-started)
- [Configuration](#configuration):
  - [Firebase Web](#firebase-web)
  - [Firebase Admin](#firebase-admin)
  - [Loading Page/State](#loading-pagestate)
- [SSR](#ssr)
  - [Extending](#extending)
  
---

## Getting Started

This template works as any NextJS application. See the [official documentation](https://nextjs.org/docs).

## Configuration

### Firebase Web 

Retrieve you web credentials by referring to the 
[Official documentation](https://firebase.google.com/docs/web/setup?sdk_version=v8). Once in your possession, open `src/lib/firebase.clien.ts` and paste them in there.

⚠️ You will <u>also</u> need to paste the value of `apiKey` at `src/lib/usrSSR/usrSSR.ts:49`.

What?! Inlining credentials, you must be mad. I hear you, I really do, but this is perfectly safe: 

> "_The apiKey in this configuration snippet just identifies your Firebase project on the Google 
servers_." 

You can read more about it 
[here](https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public/37484053#37484053).

### Firebase Admin 

Retrieve you admin credentials by referring to the
[Official documentation](https://firebase.google.com/docs/admin/setup). Once in your possession, open `src/lib/firebase.admin.ts` and update the configuration 
initialisation to fit your needs.

### Loading Page/State

Whilst waiting for the Firebase client to update your credentials, the application will display 
a loading page/state. You can modify the output at `src/providers/auth:94`.

## SSR

In order to utilise your token to fetch content on the server, you will need to wrap you page 
with the `useSSR` hook or a variant thereof (e.g. `useExampleProps`).

```tsx
export default function Login() {
  ...
}

export const getServerSideProps = useSSR(async (ctx, idToken) => {
  // Redirect to the home page if the user is already logged in.
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
```

The `useSSR` hook will handle retrieving the token from the request as well as refreshing it if 
need be before calling the user-defined callback.

### Extending

You can extend the behaviour of `useSSR` and provide more scenario-specific functionality. For 
instance, you may have data (e.g. none-firebase user record) that must be fetched before each page load. 

```tsx
export interface IUserProps {
  user: User;
}

// This is an example of a custom SSR hook that extends the base useSRR hook.
export function useUserProps<T extends IUserProps>(
  callback?: Callback
): (ctx: Context) => void {
  return useSSR(async (ctx, idToken) => {
    // Check that a token is given, otherwise redirect to the login page.
    if (!idToken)
      return {
        redirect: {
          statusCode: 301,
          destination: LOGIN_PATH,
        },
        props: {} as never,
      };
    
    // You can make data fetching calls here and merge the result.
    const user = await api.GetUser(idToken)

    return {
      props: <T>{
        user,
        ...(callback ? await callback(ctx, idToken) : {}),
      },
    };
  });
}
```

You can call the hook callback on your page to fetch any additional data.

```tsx
interface IProps extends IUserProps {
  todos: Task[];  
}

export default function page() {}

export const getServerSideProps = useUserProps<IProps>(async (ctx, idToken) => {
  ...
  
  return { todos /* Will be merged with parent props */ };
});
```
