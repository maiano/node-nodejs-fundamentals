import { promises as fs } from "fs";
import { join, resolve, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const snapshot = async () => {
  const workspacePath = join(__dirname, "workspace");

  try {
    await fs.access(workspacePath);

    const entries = [];

    const walk = async (dir) => {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = join(dir, item.name);
        const relPath = relative(workspacePath, fullPath);

        if (item.isDirectory()) {
          entries.push({ path: relPath, type: "directory" });
          await walk(fullPath);
        }

        if (item.isFile()) {
          const buffer = await fs.readFile(fullPath);

          entries.push({
            path: relPath,
            type: "file",
            size: buffer.length,
            content: buffer.toString("base64"),
          });
        }
      }
    };

    await walk(workspacePath);

    const result = {
      rootPath: resolve(workspacePath),
      entries,
    };

    await fs.writeFile(
      join(__dirname, "snapshot.json"),
      JSON.stringify(result, null, 2),
    );
  } catch {
    throw new Error("FS operation failed");
  }
};

await snapshot();
