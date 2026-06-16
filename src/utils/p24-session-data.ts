export type NormalizedP24SessionData = {
  session_id: string;
  token?: string;
  order_id?: number;
  redirect_url?: string;
  amount?: number;
  currency?: string;
  currency_code?: string;
  p24_status?: number;
  [key: string]: unknown;
};

export function getSessionId(data?: Record<string, unknown> | null): string | undefined {
  if (!data) {
    return undefined;
  }

  const sessionId = data.session_id ?? data.sessionId;
  return typeof sessionId === "string" && sessionId.length > 0
    ? sessionId
    : undefined;
}

export function getOrderId(data?: Record<string, unknown> | null): number | undefined {
  if (!data) {
    return undefined;
  }

  const orderId = data.order_id ?? data.orderId;
  if (typeof orderId === "number" && Number.isFinite(orderId)) {
    return orderId;
  }

  if (typeof orderId === "string" && orderId.trim().length > 0) {
    const parsed = Number(orderId);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function getToken(data?: Record<string, unknown> | null): string | undefined {
  if (!data) {
    return undefined;
  }

  const token = data.token;
  return typeof token === "string" && token.length > 0 ? token : undefined;
}

export function normalizeP24SessionData(
  data?: Record<string, unknown> | null,
): NormalizedP24SessionData {
  if (!data) {
    return { session_id: "" };
  }

  const sessionId = getSessionId(data);
  const orderId = getOrderId(data);
  const token = getToken(data);

  return {
    ...data,
    session_id: sessionId ?? "",
    ...(orderId != null ? { order_id: orderId, orderId } : {}),
    ...(token ? { token } : {}),
    ...(typeof data.currency === "string"
      ? { currency: data.currency, currency_code: data.currency }
      : {}),
  };
}
