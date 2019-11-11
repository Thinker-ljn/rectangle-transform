const rollup = require('rollup');
const { terser } = require('rollup-plugin-terser');
const rollupTypescript = require('rollup-plugin-typescript2');

rollup.rollup({
  input: './src/index.ts',
  plugins: [
    rollupTypescript({
      clean: true,
      exclude:['./test']
    }),
    terser()
  ]
}).then(bundle => {
  return bundle.write({
    file: './lib/rectangle-transform.min.js',
    format: 'umd',
    name: 'RectangleTransform',
    exports: 'named',
    sourcemap: true
  });
});
rollup.rollup({
  input: './src/index.ts',
  plugins: [
    rollupTypescript({
      clean: true,
      exclude:['./test']
    }),
  ]
}).then(bundle => {
  return bundle.write({
    file: './lib/rectangle-transform.js',
    format: 'umd',
    name: 'RectangleTransform',
    exports: 'named',
    sourcemap: true
  });
});