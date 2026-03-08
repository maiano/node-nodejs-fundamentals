import { Transform } from "stream";

const lineNumberer = () => {
  let count = 0;
  let leftover = "";

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");

      leftover = lines.pop();

      for (const line of lines) {
        count++;
        this.push(`${count} | ${line}\n`);
      }

      callback();
    },
    flush(callback) {
      if (leftover) {
        count++;
        this.push(`${count} | ${leftover}\n`);
      }
      callback();
    },
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

lineNumberer();
