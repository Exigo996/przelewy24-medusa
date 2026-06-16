export function coerceSandbox(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes"
    );
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return false;
}
