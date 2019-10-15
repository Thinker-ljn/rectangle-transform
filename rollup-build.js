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
    file: './dist/rectangle-transform.js',
    format: 'iife',
    name: 'RectangleTransform',
    sourcemap: true
  });
});
