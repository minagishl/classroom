const { build } = require('esbuild');
const glob = require('glob');
const fs = require('fs');
const archiver = require('archiver');
const entryPoints = glob.sync('./src/**/*.ts');

const config = {
  entryPoints,
  outdir: './dist',
  platform: 'node',
  minify: true,
  bundle: true,
};

(async () => {
  try {
    await build({ ...config });

    fs.copyFileSync('./manifest.json', './dist/manifest.json');

    fs.mkdirSync('./dist/firefox', { recursive: true });

    // Copy manifest.json to firefox directory
    fs.copyFileSync('./manifest.json', './dist/firefox/manifest.json');

    // Modify the copied manifest.json
    const data = fs.readFileSync('./dist/firefox/manifest.json', 'utf8');
    const manifest = JSON.parse(data);
    manifest.browser_specific_settings = {
      gecko: {
        id: 'minagishl@icloud.com',
      },
    };
    manifest.background = {
      scripts: ['background.js'],
    };
    fs.writeFileSync(
      './dist/firefox/manifest.json',
      JSON.stringify(manifest, null, 2),
      'utf8',
    );

    // Copy all files except manifest.json to firefox
    const files = fs.readdirSync('./dist');
    files.forEach((file) => {
      if (file !== 'firefox' && file !== 'manifest.json') {
        fs.copyFileSync(`./dist/${file}`, `./dist/firefox/${file}`);
      }
    });

    // Create a zip file
    const output = fs.createWriteStream('./dist/firefox.zip');
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on('close', function () {});

    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });

    archive.on('error', function (err) {
      throw err;
    });

    archive.pipe(output);

    // append files from a directory
    const firefoxFiles = fs.readdirSync('./dist/firefox');
    firefoxFiles.forEach((file) => {
      archive.file(`./dist/firefox/${file}`, { name: file });
    });

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    archive.finalize();

    fs.rmSync('./dist/firefox', { recursive: true });
  } catch (err) {
    console.error(err);
  }
})();
