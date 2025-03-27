const fsPromises = require('node:fs/promises');
const path = require('node:path');

async function removeDirectory(dirPath) {
  try {
    await fsPromises.access(dirPath);
    const files = await fsPromises.readdir(dirPath);

    for (const file of files) {
      const curPath = path.join(dirPath, file);
      const stat = await fsPromises.lstat(curPath);

      if (stat.isDirectory()) {
        await removeDirectory(curPath);
      } else {
        await fsPromises.unlink(curPath);
      }
    }

    await fsPromises.rmdir(dirPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

(async () => {
  try {
    await removeDirectory(path.join(__dirname, '../dist'));
  } catch (err) {
    console.error(err.message);
  }
})();
