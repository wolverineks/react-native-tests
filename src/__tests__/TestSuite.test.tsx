import * as React from 'react';
import { SafeAreaView } from 'react-native';
import { render, waitForElement } from '@testing-library/react-native';

import TestSuite from '..';

describe('TestSuite', () => {
  it('should display passed results', async () => {
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
    getByText('Results: passed');
  });

  it('should display failed results', async () => {
    const { getByText } = render(
      <SafeAreaView>
        <TestSuite
          tests={[
            () => ({ describe, it, expect }) => {
              describe('failing test 1', () => {
                it('should not pass', async () => {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  expect(1).toBe(2);
                });
              });

              describe('failing test 2', () => {
                it('should not pass', async () => {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  expect(1).toBe(3);
                });
              });
            },
          ]}
        />
      </SafeAreaView>
    );

    getByText('Status: running');
    await waitForElement(() => expect(getByText('Status: done')));
    getByText('Results: failed');
  });
});
