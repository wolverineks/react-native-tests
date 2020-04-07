import * as React from 'react';
// @ts-ignore
import jasmineModule from 'jasmine-core/lib/jasmine-core/jasmine';

import { Tester, Test, jasmine } from './types';

export const useJasmine = () => {
  const [status, setStatus] = React.useState<Tester['status']>('running');
  const [overallStatus, setOverallStatus] = React.useState<string>();
  const [jasmineCore] = React.useState(() => jasmineModule.core(jasmineModule));
  const [jasmineEnv] = React.useState<jasmine.Env>(() => jasmineCore.getEnv());
  const [jasmineInterface] = React.useState(() =>
    jasmineModule.interface(jasmineCore, jasmineEnv)
  );
  const [, rerender] = React.useState();

  React.useEffect(() => {
    (jasmineEnv as jasmine.Env).addReporter({
      jasmineStarted: () => rerender({}),
      jasmineDone: overallResult => {
        setOverallStatus(overallResult.overallStatus);
        setStatus('done');
      },
      suiteStarted: () => rerender({}),
      suiteDone: () => rerender({}),
      specStarted: () => rerender({}),
      specDone: () => rerender({}),
    });

    return jasmineEnv.clearReporters;
  }, [jasmineEnv]);

  const registerTests = React.useCallback(
    (tests: ReturnType<Test>[]) => {
      tests.forEach(testSuite =>
        testSuite({ ...jasmineCore, ...jasmineInterface })
      );

      rerender({});
    },
    [jasmineCore, jasmineInterface]
  );

  return {
    root: jasmineEnv.topSuite(),
    status,
    result: overallStatus,
    runTests: jasmineEnv.execute,
    registerTests,
    ...jasmineInterface,
  };
};
