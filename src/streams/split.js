import fs from "fs";
import { Transform } from "stream";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getLinesArg = () => {
  const index = process.argv.indexOf("--lines");
  if (index !== -1 && index + 1 < process.argv.length) {
    const n = parseInt(process.argv[index + 1]);
    if (!isNaN(n) && n > 0) return n;
  }
  return 10;
};

const split = async () => {
  const linesPerChunk = getLinesArg();
  const sourceFile = path.join(__dirname, "source.txt");

  if (!fs.existsSync(sourceFile)) {
    throw new Error("FS operation failed");
  }

  let leftover = "";
  let buffer = [];
  let chunkIndex = 1;

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");
      leftover = lines.pop();

      for (const line of lines) {
        buffer.push(line);
        if (buffer.length === linesPerChunk) {
          const filename = path.join(__dirname, `chunk_${chunkIndex}.txt`);
          fs.writeFileSync(filename, buffer.join("\n") + "\n");
          buffer = [];
          chunkIndex++;
        }
      }

      callback();
    },
    flush(callback) {
      if (leftover) buffer.push(leftover);
      if (buffer.length > 0) {
        const filename = path.join(__dirname, `chunk_${chunkIndex}.txt`);
        fs.writeFileSync(filename, buffer.join("\n") + "\n");
      }
      callback();
    },
  });

  const readStream = fs.createReadStream(sourceFile);
  readStream.pipe(transformer);
};

split().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
