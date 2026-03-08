import { Transform } from "stream";

const filter = () => {
  const pattern = process.argv[process.argv.indexOf("--pattern") + 1];
  if (!pattern) {
    console.error("No --pattern");
    process.exit(1);
  }

  let leftover = "";

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");
      leftover = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + "\n");
        }
      }

      callback();
    },
    flush(callback) {
      if (leftover && leftover.includes(pattern)) {
        this.push(leftover + "\n");
      }
      callback();
    },
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

filter();
