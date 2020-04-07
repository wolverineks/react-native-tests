import * as React from 'react';
import { FlatList, View } from 'react-native';

import { Render, Test, Suite } from './types';
import { Header, Portal, TopLevelSuite } from './components';
import { useTester } from './useTester';

export const TestSuite: React.FC<{ tests: Test[] }> = ({ tests }) => {
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

    registerTests(tests.map(_test => _test(render)));
    runTests();
  }, [registerTests, runTests, tests]);

  const { children } = root;

  return (
    <View>
      <Portal>{Component}</Portal>

      <View>
        <Header status={status} result={result || '-------'} />

        <FlatList
          contentContainerStyle={{ padding: 4, paddingBottom: 100 }}
          data={Object.values(children)}
          renderItem={({ item: suite }) => (
            <TopLevelSuite
              suite={suite as Suite}
              key={(suite as Suite).description}
            />
          )}
        />
      </View>
    </View>
  );
};
