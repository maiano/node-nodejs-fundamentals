import readline from "readline";

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", (line) => {
    const command = line.trim();

    switch (command) {
      case "uptime":
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        break;

      case "cwd":
        console.log(process.cwd());
        break;

      case "date":
        console.log(new Date().toISOString());
        break;

      case "exit":
        rl.close();
        return;

      default:
        console.log("Unknown command");
    }

    rl.prompt();
  });

  rl.on("close", () => {
    console.log("Bye!");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    rl.close();
  });
};

interactive();
