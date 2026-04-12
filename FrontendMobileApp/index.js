/**
 * @format
 */

import {AppRegistry} from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import App from './App';
import {name as appName} from './app.json';

// Silence Reanimated render-time warnings (Common frame-drop noise)
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

AppRegistry.registerComponent(appName, () => App);
