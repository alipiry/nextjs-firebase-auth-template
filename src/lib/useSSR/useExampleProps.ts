import { LOGIN_PATH } from '@lib/common';
import { Callback, Context, useSSR } from './useSSR';

export interface IExamplePageProps {}

// This is an example of a custom SSR hook that extends the base useSRR hook.
export function useExampleProps<T extends IExamplePageProps>(
  callback?: Callback
): (ctx: Context) => void {
  return useSSR(async (ctx, idToken) => {
    if (!idToken)
      return {
        redirect: {
          statusCode: 301,
          destination: LOGIN_PATH,
        },
        props: {} as never,
      };

    return {
      props: <T>{
        ...(callback ? await callback(ctx, idToken) : {}),
      },
    };
  });
}
