type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production" && level === "info") {
    return;
  }

  const payload = meta ? { message, ...meta } : { message };

  if (level === "error") {
    console.error(payload);
    return;
  }

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.info(payload);
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>): void =>
    log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>): void =>
    log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>): void =>
    log("error", message, meta),
  /** תמיד נכתב גם בפרודקשן — לסיכומי סנכron */
  sync: (message: string, meta?: Record<string, unknown>): void => {
    console.warn(meta ? { message, ...meta } : { message });
  },
};
