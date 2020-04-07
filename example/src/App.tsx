import * as React from 'react';
import TestSuite from 'react-native-tests';
import { SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView>
      <TestSuite
        tests={[
          () => ({ describe, it, expect }) => {
            describe('example test 1', () => {
              it('should pass', async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                expect(1).toBe(1);
              });
            });

            describe('example test 2', () => {
              it('should also pass', async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                expect(1).toBe(1);
              });
            });
          },
        ]}
      />
    </SafeAreaView>
  );
}
