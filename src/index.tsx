import { NativeModules } from 'react-native';

type TestsType = {
  getDeviceName(): Promise<string>;
};

const { Tests } = NativeModules;

export default Tests as TestsType;
