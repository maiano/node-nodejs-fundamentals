import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const partsPath = join(__dirname, "workspace", "parts");
const mergedPath = join(__dirname, "workspace", "merged.txt");

const filesArgIndex = process.argv.indexOf("--files");
const filesList =
  filesArgIndex !== -1 && process.argv[filesArgIndex + 1]
    ? process.argv[filesArgIndex + 1].split(",")
    : null;

const merge = async () => {
  try {
    await fs.access(partsPath);

    let files;

    if (filesList) {
      for (const f of filesList) {
        try {
          await fs.access(join(partsPath, f));
        } catch {
          throw new Error("FS operation failed");
        }
      }

      files = filesList;
    } else {
      const items = await fs.readdir(partsPath, { withFileTypes: true });

      files = items
        .filter((i) => i.isFile() && i.name.endsWith(".txt"))
        .map((i) => i.name)
        .sort();

      if (files.length === 0) {
        throw new Error("FS operation failed");
      }
    }

    let mergedContent = "";

    for (const f of files) {
      const content = await fs.readFile(join(partsPath, f), "utf8");
      mergedContent += content;
    }

    await fs.writeFile(mergedPath, mergedContent);
  } catch {
    throw new Error("FS operation failed");
  }
};

await merge();
