const progress = () => {
  const duration = 5000;
  const interval = 100;
  const length = 30;

  const steps = duration / interval;
  let current = 0;

  const timer = setInterval(() => {
    current++;

    const percent = Math.floor((current / steps) * 100);
    const filled = Math.floor((percent / 100) * length);

    const bar = "█".repeat(filled) + " ".repeat(length - filled);

    process.stdout.write(`\r[${bar}] ${percent}%`);

    if (percent >= 100) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
