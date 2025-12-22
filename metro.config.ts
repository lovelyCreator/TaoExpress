const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext: string) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// Add minifier configuration to reduce bundle size
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    compress: {
      drop_console: true,  // Remove console logs in production
      reduce_vars: true
    }
  }
};

module.exports = config;