import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { createBrotliCompress } from "zlib";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Readable } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workspace = path.join(__dirname, "workspace");
const srcDir = path.join(workspace, "toCompress");
const outDir = path.join(workspace, "compressed");
const archive = path.join(outDir, "archive.br");

async function getFiles(dir, base = dir) {
  const entries = await fsPromises.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await getFiles(full, base)));
    } else {
      files.push({ full, rel: path.relative(base, full) });
    }
  }
  return files;
}

async function* archiveStream(files) {
  for (const file of files) {
    const stat = await fsPromises.stat(file.full);

    const header = Buffer.from(
      JSON.stringify({
        path: file.rel,
        size: stat.size,
      }),
    );

    const len = Buffer.alloc(4);
    len.writeUInt32BE(header.length);

    yield len;
    yield header;

    const rs = fs.createReadStream(file.full);

    for await (const chunk of rs) {
      yield chunk;
    }
  }
}

const compressDir = async () => {
  try {
    await fsPromises.access(srcDir);
  } catch {
    throw new Error("FS operation failed");
  }

  await fsPromises.mkdir(outDir, { recursive: true });

  const files = await getFiles(srcDir);

  await pipeline(
    Readable.from(archiveStream(files)),
    createBrotliCompress(),
    fs.createWriteStream(archive),
  );
};

export { compressDir };

if (import.meta.url === `file://${process.argv[1]}`) {
  await compressDir();
}
