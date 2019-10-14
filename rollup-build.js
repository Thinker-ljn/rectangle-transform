const rollup = require('rollup');
const { terser } = require('rollup-plugin-terser');
const rollupTypescript = require('rollup-plugin-typescript');

rollup.rollup({
  input: './src/index.ts',
  plugins: [
    rollupTypescript(),
    terser()
  ]
}).then(bundle => {
  return bundle.write({
    file: './dist/rectangle-translate.js',
    format: 'iife',
    name: 'RectangleTranslate',
    sourcemap: true
  });
});
