type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = import.meta.env.MODE === "development";

function formatMessage(level: LogLevel, message: string, meta?: unknown) {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level: level.toUpperCase(),
    message,
    meta,
  };
}

function log(level: LogLevel, message: string, meta?: unknown) {
  const formatted = formatMessage(level, message, meta);

  // Log differently depending on environment
  if (isDev) {
    const colorMap: Record<LogLevel, string> = {
      debug: "color: gray",
      info: "color: gray",
      warn: "color: orange",
      error: "color: red",
    };

    console.log(
      `%c[${formatted.level}] ${formatted.timestamp}: ${formatted.message}`,
      colorMap[level],
      formatted.meta || "",
    );
  } else {
    // In production, send to console (or remote logger later)
    switch (level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => log("debug", message, meta),
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
};
