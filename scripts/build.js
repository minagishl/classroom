const { build } = require("esbuild");
const glob = require("glob");
const fs = require("node:fs");
const archiver = require("archiver");
const entryPoints = glob.sync("./src/**/*.ts");

const config = {
  entryPoints,
  outdir: "./dist",
  platform: "node",
  minify: true,
  bundle: true,
};

(async () => {
  try {
    await build({ ...config });

    // images folder copy
    fs.mkdirSync("./dist/images", { recursive: true });
    const images = fs.readdirSync("./images");
    for (const image of images) {
      fs.copyFileSync(`./images/${image}`, `./dist/images/${image}`);
    }

    fs.copyFileSync("./manifest.json", "./dist/manifest.json");

    fs.mkdirSync("./dist/firefox", { recursive: true });

    // Copy manifest.json to firefox directory
    fs.copyFileSync("./manifest.json", "./dist/firefox/manifest.json");

    // Modify the copied manifest.json
    const data = fs.readFileSync("./dist/firefox/manifest.json", "utf8");
    const manifest = JSON.parse(data);
    manifest.browser_specific_settings = {
      gecko: {
        id: "minagishl@icloud.com",
      },
    };
    manifest.background = {
      scripts: ["background.js"],
    };
    // Remove the run_at key
    const { run_at, ...contentScript } = manifest.content_scripts[0];
    manifest.content_scripts[0] = contentScript;
    fs.writeFileSync(
      "./dist/firefox/manifest.json",
      JSON.stringify(manifest, null, 2),
      "utf8",
    );

    // Copy all files except manifest.json to firefox
    const files = fs.readdirSync("./dist");
    for (const file of files) {
      if (file !== "firefox" && file !== "manifest.json" && file !== "images") {
        fs.copyFileSync(`./dist/${file}`, `./dist/firefox/${file}`);
      }
    }

    // images folder copy
    fs.mkdirSync("./dist/firefox/images", { recursive: true });
    const firefoxImages = fs.readdirSync("./images");
    for (const image of firefoxImages) {
      fs.copyFileSync(`./images/${image}`, `./dist/firefox/images/${image}`);
    }

    // Create a zip file
    const output = fs.createWriteStream("./dist/firefox.zip");
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on("close", () => {});

    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(output);

    // append files from a directory
    const firefoxFiles = fs.readdirSync("./dist/firefox");
    for (const file of firefoxFiles) {
      archive.file(`./dist/firefox/${file}`, { name: file });
    }

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    archive
      .finalize()
      .then(() => {
        fs.rm("./dist/firefox", { recursive: true }, (err) => {
          if (err) throw err;
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.error(err);
  }
})();
