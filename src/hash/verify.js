import { createReadStream } from "fs";
import { promises as fs } from "fs";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const verify = async () => {
  let checksums;

  try {
    checksums = JSON.parse(
      await fs.readFile(join(__dirname, "checksums.json"), "utf8"),
    );
  } catch {
    throw new Error("FS operation failed");
  }

  for (const [file, expected] of Object.entries(checksums)) {
    try {
      const hash = createHash("sha256");

      for await (const chunk of createReadStream(join(__dirname, file))) {
        hash.update(chunk);
      }

      console.log(
        `${file} — ${hash.digest("hex") === expected ? "OK" : "FAIL"}`,
      );
    } catch {
      console.log(`${file} — FAIL`);
    }
  }
};

await verify();
