const SENSITIVE_KEYS = new Set([
  "email",
  "clientemail",
  "clientname",
  "clientaddres",
  "clientaddress",
  "clientcity",
  "clientpostcode",
  "cardnumber",
  "cvv",
  "blikcode",
  "phone",
  "authorizationcode",
  "useragent",
  "ip",
]);

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) {
    return "[REDACTED]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactUnknown(item));
  }

  if (value && typeof value === "object") {
    return redactUnknown(value);
  }

  return value;
}

export function redactUnknown(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactUnknown(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const output: Record<string, unknown> = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    output[key] = redactValue(key, nestedValue);
  }

  return output;
}

type LoggerLike = {
  debug: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};

export function createP24Logger(
  logger: LoggerLike | undefined,
  debugEnabled: boolean,
): LoggerLike {
  const safeLogger = logger ?? console;

  return {
    debug: (message: string) => {
      if (debugEnabled) {
        safeLogger.debug(message);
      }
    },
    info: (message: string) => safeLogger.info(message),
    warn: (message: string) => safeLogger.warn(message),
    error: (message: string) => safeLogger.error(message),
  };
}
