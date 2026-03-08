import { spawn } from "child_process";

const execCommand = () => {
  const command = process.argv[2];

  const child = spawn(command, {
    shell: true,
    env: process.env,
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.on("close", (code) => {
    process.exit(code);
  });
};

execCommand();
