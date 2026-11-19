// Collects every StyleX rule into one static stylesheet at the @stylex directive.
module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      useCSSLayers: true,
    },
  },
};
