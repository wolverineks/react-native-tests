import * as React from 'react';
import { FlatList } from 'react-native';

import { Render, Test, Suite } from './types';
import { Header, Portal, TopLevelSuite } from './components';
import { useTester } from './useTester';

export const useTestSuite = (tests: Test[]) => {
  const { registerTests, runTests, status, result, root } = useTester();
  const [Component, setComponent] = React.useState<React.ReactElement | null>(
    null
  );
  const ref = React.useRef();

  React.useEffect(() => {
    const render: Render = ({ Component, waitFor, onError }) => {
      return new Promise((resolve, reject) => {
        const cloneProps = {
          ref,
          key: Math.random(), // to prevent reusing component across multiple tests
          ...(waitFor && { [waitFor]: () => resolve(ref.current) }),
          ...(onError && { [onError]: reject }),
        };
        const clone = React.cloneElement(Component, cloneProps);

        setComponent(clone);
      });
    };

    registerTests(tests.map(_test => tester => _test(tester, render)));
    runTests();
  }, [registerTests, runTests, tests]);

  return {
    Component,
    result,
    status,
    testSuites: Object.values(root.children),
  };
};

export const TestSuite: React.FC<{ tests: Test[] }> = ({ tests }) => {
  const { Component, status, result, testSuites } = useTestSuite(tests);

  return (
    <FlatList
      ListHeaderComponent={
        <Header status={status} result={result || '-------'} />
      }
      ListFooterComponent={<Portal>{Component}</Portal>}
      data={testSuites}
      renderItem={({ item: suite }) => (
        <TopLevelSuite
          suite={suite as Suite}
          key={(suite as Suite).description}
        />
      )}
    />
  );
};
