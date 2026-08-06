import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Self keep-alive: keep the free-tier instance warm without external cron.
  const selfUrl = process.env["PUBLIC_BASE_URL"] ?? "";
  if (selfUrl) {
    setInterval(() => {
      fetch(`${selfUrl}/api/health`).catch(() => {});
    }, 10 * 60 * 1000);
    logger.info({ selfUrl }, "Self keep-alive enabled");
  }
});
