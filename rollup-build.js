const rollup = require('rollup');
const { terser } = require('rollup-plugin-terser');
const rollupTypescript = require('rollup-plugin-typescript2');

rollup.rollup({
  input: './src/index.ts',
  plugins: [
    rollupTypescript(),
    terser()
  ]
}).then(bundle => {
  return bundle.write({
    file: './lib/rectangle-transform.js',
    format: 'iife',
    name: 'RectangleTransform',
    exports: 'named',
    sourcemap: true
  });
});
