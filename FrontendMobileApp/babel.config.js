module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    ['module-resolver', {
      root: ['./'],
      alias: {
        '@': './src',
      },
    }],
    'react-native-worklets-core/plugin',
    'react-native-reanimated/plugin',
  ],
};
