import * as React from 'react';

import { useJasmine } from './useJasmine';
import { Tester } from './types';

const TesterContext = React.createContext<Tester | undefined>(undefined);

export const TesterProvider: React.FC = ({ children }) => (
  <TesterContext.Provider value={useJasmine()}>
    {children}
  </TesterContext.Provider>
);

const missingContext = () => {
  throw new Error('useTester must be rendered in a TesterProvider');
};

export const useTesterContext = () =>
  React.useContext(TesterContext) || missingContext();
export const useRoot = () => useTesterContext().root;
export const useStatus = () => useTesterContext().status;
export const useResult = () => useTesterContext().result;
export const useRunTests = () => useTesterContext().runTests;
export const useRegisterTests = () => useTesterContext().registerTests;
export const useReset = () => useTesterContext().reset;
