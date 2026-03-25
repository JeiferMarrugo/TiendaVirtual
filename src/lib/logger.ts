type LogLevel = "info" | "success" | "warn" | "error";

const COLORS = {
  info:    "\x1b[36m",  // cyan
  success: "\x1b[32m",  // green
  warn:    "\x1b[33m",  // yellow
  error:   "\x1b[31m",  // red
  reset:   "\x1b[0m",
  dim:     "\x1b[2m",
  bold:    "\x1b[1m",
};

function timestamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 23);
}

function format(level: LogLevel, tag: string, message: string, data?: unknown) {
  const color = COLORS[level];
  const label = level.toUpperCase().padEnd(7);
  const prefix = `${COLORS.dim}${timestamp()}${COLORS.reset} ${color}${COLORS.bold}${label}${COLORS.reset} ${COLORS.bold}${tag}${COLORS.reset}`;

  if (data !== undefined) {
    const dataStr =
      typeof data === "object"
        ? "\n" + JSON.stringify(data, null, 2)
        : " " + String(data);
    console.log(`${prefix} ${message}${dataStr}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

export const logger = {
  info(tag: string, message: string, data?: unknown) {
    format("info", tag, message, data);
  },
  success(tag: string, message: string, data?: unknown) {
    format("success", tag, message, data);
  },
  warn(tag: string, message: string, data?: unknown) {
    format("warn", tag, message, data);
  },
  error(tag: string, message: string, error?: unknown) {
    format("error", tag, message);
    if (error instanceof Error) {
      console.error(`${COLORS.error}  ↳ ${error.message}${COLORS.reset}`);
      if (error.stack) {
        const stackLines = error.stack.split("\n").slice(1, 5);
        stackLines.forEach((line) =>
          console.error(`${COLORS.dim}    ${line.trim()}${COLORS.reset}`),
        );
      }
    } else if (error !== undefined) {
      console.error(`${COLORS.error}  ↳ ${String(error)}${COLORS.reset}`);
    }
  },
  /** Devuelve una función que al llamarla imprime el tiempo transcurrido */
  timer(tag: string, label: string) {
    const start = Date.now();
    return () => {
      const ms = Date.now() - start;
      format("info", tag, `${label} — ${COLORS.bold}${ms}ms${COLORS.reset}`);
    };
  },
};
