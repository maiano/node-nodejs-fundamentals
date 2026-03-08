import { promises as fs } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const restore = async () => {
  try {
    const snapshotPath = join(__dirname, "snapshot.json");
    const data = JSON.parse(await fs.readFile(snapshotPath, "utf8"));

    const target = resolve(__dirname, "workspace_restored");

    try {
      await fs.access(target);
      throw new Error();
    } catch {
      await fs.mkdir(target, { recursive: true });
    }

    for (const entry of data.entries) {
      const fullPath = join(target, entry.path);

      if (entry.type === "directory") {
        await fs.mkdir(fullPath, { recursive: true });
      }

      if (entry.type === "file") {
        await fs.mkdir(dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, Buffer.from(entry.content, "base64"));
      }
    }
  } catch {
    throw new Error("FS operation failed");
  }
};

await restore();
