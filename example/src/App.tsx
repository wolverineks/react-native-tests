import * as React from 'react';
import TestSuite from 'react-native-tests';
import { SafeAreaView, View, Text } from 'react-native';

export default function App() {
  return (
    <SafeAreaView>
      <TestSuite
        tests={[
          ({ describe, it, expect }, render) => {
            describe('simple example', () => {
              it('should pass', async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                expect(1).toBe(1);
              });
            });

            describe('example with component', () => {
              it('should also pass', async () => {
                const component = await render<FooHandle>({
                  Component: <Foo />,
                  waitFor: 'onLayout',
                });
                const result = component.bar();
                expect(result).toBe(123);
                expect(1).toBe(1);
              });
            });
          },
        ]}
      />
    </SafeAreaView>
  );
}

interface FooHandle {
  bar: () => number;
}

const Foo = React.forwardRef<FooHandle, {}>((props, ref) => {
  React.useImperativeHandle(ref, () => ({
    bar: () => 123,
  }));

  return (
    <View {...props}>
      <Text>Hello, World!</Text>
    </View>
  );
});
