import fs from "fs/promises";
import os from "os";
import path from "path";
import { Worker } from "worker_threads";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mergeSortedArrays = (arrays) => {
  const result = [];
  const indexes = new Array(arrays.length).fill(0);

  while (true) {
    let min = Infinity;
    let minArray = -1;

    for (let i = 0; i < arrays.length; i++) {
      const idx = indexes[i];
      if (idx < arrays[i].length && arrays[i][idx] < min) {
        min = arrays[i][idx];
        minArray = i;
      }
    }

    if (minArray === -1) break;

    result.push(min);
    indexes[minArray]++;
  }

  return result;
};

const main = async () => {
  const dataPath = path.join(__dirname, "data.json");
  const workerPath = path.join(__dirname, "worker.js");

  const raw = await fs.readFile(dataPath, "utf8");
  const numbers = JSON.parse(raw);

  const cpuCount = os.cpus().length;
  const chunkSize = Math.ceil(numbers.length / cpuCount);

  const chunks = [];
  for (let i = 0; i < cpuCount; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunk = numbers.slice(start, end);
    if (chunk.length > 0) chunks.push(chunk);
  }

  const workers = chunks.map((chunk) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(workerPath);

      worker.once("message", (sortedChunk) => {
        worker.terminate();
        resolve(sortedChunk);
      });

      worker.once("error", (err) => {
        worker.terminate();
        reject(err);
      });

      worker.postMessage(chunk);
    });
  });

  const sortedChunks = await Promise.all(workers);
  const finalSorted = mergeSortedArrays(sortedChunks);

  console.log(finalSorted);
};

await main();
