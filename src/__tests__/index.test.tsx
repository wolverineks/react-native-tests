import * as React from 'react';
import { SafeAreaView } from 'react-native';
import { render, waitForElement } from '@testing-library/react-native';

import TestSuite from '../';

describe('TestSuite', () => {
  it('should render', async () => {
    const { getByText } = render(
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

    getByText('Status: running');
    await waitForElement(() => expect(getByText('Status: done')));
  });
});
