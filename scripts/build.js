const { build } = require('esbuild');
const glob = require('glob');
const fs = require('fs');
const entryPoints = glob.sync('./src/**/*.ts');

const config = {
  entryPoints,
  outdir: './dist',
  platform: 'node',
  minify: true,
  bundle: true,
};

build({
  ...config,
}).then(() => {
  fs.copyFile('./manifest.json', './dist/manifest.json', (err) => {
    if (err) throw err;
    console.log('manifest.json was copied to dist directory');
  });
});
