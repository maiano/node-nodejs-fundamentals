import { promises as fs } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workspacePath = join(__dirname, "workspace");

const extArgIndex = process.argv.indexOf("--ext");
const ext =
  extArgIndex !== -1 && process.argv[extArgIndex + 1]
    ? `.${process.argv[extArgIndex + 1]}`
    : ".txt";

const findByExt = async () => {
  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const files = [];

  const walk = async (dir) => {
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = join(dir, item.name);

      if (item.isDirectory()) {
        await walk(fullPath);
      }

      if (item.isFile() && item.name.endsWith(ext)) {
        files.push(relative(workspacePath, fullPath));
      }
    }
  };

  await walk(workspacePath);

  files.sort().forEach((f) => console.log(f));
};

await findByExt();
