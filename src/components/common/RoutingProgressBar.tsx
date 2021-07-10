import React from 'react';
import { useRouter } from 'next/router';
import nprogress from 'nprogress';

nprogress.configure({
  template: `<div id="routing-progress-bar" role="bar"></div>`,
  showSpinner: false,
});

const RoutingProgressBarComponent: React.FC = () => {
  const router = useRouter();

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    function start() {
      timeout = setTimeout(nprogress.start, 100);
    }

    function done() {
      clearTimeout(timeout);
      nprogress.done();
    }

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);

    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router]);

  return <></>;
};

export const RoutingProgressBar = React.memo(RoutingProgressBarComponent);
