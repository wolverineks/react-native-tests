import * as React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

import {
  useRunTests,
  useRegisterTests,
  TesterProvider,
  useStatus,
  useRoot,
  useResult,
} from './tester';
import { jasmine, Render, Test } from './types';

export const TestSuite: React.FC<{ tests: Test[] }> = ({ tests }) => (
  <TesterProvider>
    <Tests tests={tests} />
  </TesterProvider>
);

export const Tests: React.FC<{ tests: Test[] }> = ({ tests, ...props }) => {
  const registerTests = useRegisterTests();
  const runTests = useRunTests();
  const status = useStatus();
  const result = useResult();
  const root = useRoot();

  const [Component, setComponent] = React.useState<React.ReactElement | null>(
    null
  );

  React.useEffect(() => {
    const render: Render = (
      ComponentUnderTest: React.ReactElement,
      makeProps
    ) => {
      return new Promise((resolve, reject) =>
        setComponent(
          React.cloneElement(ComponentUnderTest, {
            ...makeProps({ onReady: resolve, onError: reject }),
            key: Math.random(), // to prevent reusing component across multiple tests
          })
        )
      );
    };

    registerTests(tests.map(_test => _test(render)));
    runTests();
  }, [registerTests, runTests, tests]);

  const { children } = root;

  return (
    <View>
      <Portal>{Component}</Portal>

      <View style={styles.results} {...props}>
        <Header status={status} result={result || '-------'} />

        <FlatList
          contentContainerStyle={styles.testList}
          data={Object.values(children)}
          renderItem={({ item: suite }) => (
            <TopLevelSuite
              suite={suite as jasmine.Suite}
              key={(suite as jasmine.Suite).description}
            />
          )}
        />
      </View>
    </View>
  );
};

const Portal: React.FC = ({ children }) => (
  <View style={{ position: 'absolute', opacity: 0 }}>{children}</View>
);

const Header: React.FC<{ status: string; result: string }> = ({
  status,
  result,
}) => (
  <View
    style={[
      status === 'running'
        ? styles.running
        : result === 'passed'
        ? styles.passed
        : result === 'failed'
        ? styles.failed
        : {},
      styles.header,
    ]}
  >
    <View style={{ flex: 1, padding: 4 }}>
      <Text style={{ fontSize: 20 }}>Status: {status}</Text>
    </View>

    <View style={{ flex: 1, padding: 4 }}>
      <Text style={{ fontSize: 20 }}>Results: {result}</Text>
    </View>
  </View>
);

const TopLevelSuite: React.FC<{ suite: jasmine.Suite }> = ({ suite }) => (
  <View style={styles.topLevelSuite}>
    <Text style={{ fontWeight: 'bold' }}>{suite.description}</Text>
    {renderChildren(suite.children)}
  </View>
);

const Suite: React.FC<{ suite: jasmine.Suite }> = ({ suite }) => (
  <View style={styles.suite}>
    <Text>{suite.description}</Text>
    {renderChildren(suite.children)}
  </View>
);

const Spec: React.FC<{ spec: jasmine.Spec }> = ({ spec }) => {
  const status = spec.status();

  return spec.result.duration === null ? (
    <RunningSpec spec={spec} />
  ) : status === 'passed' ? (
    <PassedSpec spec={spec} />
  ) : status === 'failed' ? (
    <FailedSpec spec={spec} />
  ) : status === 'pending' ? (
    <DisabledSpec spec={spec} />
  ) : null;
};

const Expectation: React.FC<{
  expectation: jasmine.FailedExpectation;
}> = ({ expectation: { message } }) => (
  <View style={styles.expectation}>
    <Text>{message}</Text>
  </View>
);

const RunningSpec: React.FC<{ spec: jasmine.Spec }> = ({ spec }) => (
  <View style={[styles.spec, styles.runningSpec]}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ paddingHorizontal: 8 }}>
        <Emoji type={'running'} />
      </View>

      <Text>{spec.description}</Text>
    </View>
  </View>
);

const DisabledSpec: React.FC<{ spec: jasmine.Spec }> = ({ spec }) => (
  <View style={[styles.spec, styles.disabledSpec]}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ paddingHorizontal: 8 }}>
        <Emoji type={'disabled'} />
      </View>

      <Text>{spec.description}</Text>
    </View>
  </View>
);

const PassedSpec: React.FC<{ spec: jasmine.Spec }> = ({ spec }) => (
  <View style={[styles.spec, styles.passedSpec]}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ paddingHorizontal: 8 }}>
        <Emoji type={'passed'} />
      </View>

      <Text>{spec.description}</Text>
    </View>
  </View>
);

const FailedSpec: React.FC<{ spec: jasmine.Spec }> = ({ spec }) => (
  <View style={[styles.spec, styles.failedSpec]}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ paddingHorizontal: 8 }}>
        <Emoji type={'failed'} />
      </View>

      <Text>{spec.description}</Text>
    </View>

    {spec.result.failedExpectations.map(
      (expectation: jasmine.FailedExpectation) => (
        <Expectation
          expectation={expectation}
          key={`${expectation.matcherName} - ${expectation.message}`}
        />
      )
    )}
  </View>
);

const EMOJIS = {
  running: '😶',
  passed: '😄',
  failed: '😞',
  disabled: '🤐',
} as const;

const Emoji: React.FC<{ type: keyof typeof EMOJIS }> = ({
  type = 'running',
}) => <Text>{EMOJIS[type]}</Text>;

const renderChildren = (children: {
  [id: string]: jasmine.Suite | jasmine.Spec;
}) =>
  children
    ? Object.values(children).map(child =>
        // @ts-ignore
        child.getSpecName ? (
          <Spec spec={child as jasmine.Spec} key={child.id} />
        ) : (
          <View key={child.id} style={{ paddingLeft: 16 }}>
            <Suite key={child.id} suite={child as jasmine.Suite} />
          </View>
        )
      )
    : null;

const COLORS = {
  DISABLED: 'grey',
  PASSED: 'green',
  FAILED: 'red',
  RUNNING: 'yellow',
} as const;

const styles = StyleSheet.create({
  running: { backgroundColor: COLORS.RUNNING },
  passed: { backgroundColor: COLORS.PASSED },
  failed: { backgroundColor: COLORS.FAILED },
  results: {},
  testList: { padding: 4, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
  },
  topLevelSuite: {
    padding: 8,
    borderRadius: 10,
  },
  suite: {},
  spec: { borderLeftWidth: 3, padding: 2, margin: 2 },
  disabledSpec: { borderLeftColor: COLORS.DISABLED },
  passedSpec: { borderLeftColor: COLORS.PASSED },
  failedSpec: { borderLeftColor: COLORS.FAILED },
  runningSpec: { borderLeftColor: COLORS.RUNNING },
  expectation: { paddingLeft: 8 },
});
