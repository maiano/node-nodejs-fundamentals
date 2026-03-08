import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { createBrotliDecompress } from "zlib";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workspace = path.join(__dirname, "workspace");
const archive = path.join(workspace, "compressed", "archive.br");
const outDir = path.join(workspace, "decompressed");

const decompressDir = async () => {
  try {
    await fsPromises.access(archive);
  } catch {
    throw new Error("FS operation failed");
  }

  await fsPromises.mkdir(outDir, { recursive: true });

  const read = fs.createReadStream(archive);
  const brotli = createBrotliDecompress();

  const decompressStream = read.pipe(brotli);

  let buffer = Buffer.alloc(0);

  for await (const chunk of decompressStream) {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 4) {
      const headerLen = buffer.readUInt32BE(0);
      if (buffer.length < 4 + headerLen) break;

      const header = JSON.parse(buffer.subarray(4, 4 + headerLen).toString());
      if (buffer.length < 4 + headerLen + header.size) break;

      const fileData = buffer.subarray(
        4 + headerLen,
        4 + headerLen + header.size,
      );

      const filePath = path.join(outDir, header.path);

      await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
      await fsPromises.writeFile(filePath, fileData);

      buffer = buffer.subarray(4 + headerLen + header.size);
    }
  }
};

export { decompressDir };

if (import.meta.url === `file://${process.argv[1]}`) {
  await decompressDir();
}
