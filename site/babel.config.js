const path = require('path');
const dev = process.env.NODE_ENV !== 'production';

// StyleX compiles stylex.create() calls to atomic class names at build time.
module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev,
        runtimeInjection: false,
        enableInlinedConditionalMerge: true,
        treeshakeCompensation: true,
        aliases: { '@/*': [path.join(__dirname, 'src/*')] },
        unstable_moduleResolution: { type: 'commonJS', rootDir: __dirname },
      },
    ],
  ],
};
