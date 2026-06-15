import { P24ApiService } from "../providers/przelewy24/services/p24-api";
import { PaymentProviderKeys } from "../providers/przelewy24/types";

export type P24PaymentMethodRecord = {
  id: number;
  name: string;
  group: string;
};

export type P24PaymentMethodMetadata = {
  paymentMethod: number;
  paymentMethodName: string;
  paymentMethodGroup: string;
};

type MethodsCacheEntry = {
  expiresAt: number;
  methods: P24PaymentMethodRecord[];
};

const METHODS_CACHE_TTL_MS = 15 * 60 * 1000;
const methodsCache = new Map<string, MethodsCacheEntry>();

export function parseP24MethodId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.trunc(parsed);
    }
  }

  return undefined;
}

function buildMethodsCacheKey(
  lang: string,
  amountGrosze: number,
  currency: string,
): string {
  return `${lang.toLowerCase()}:${amountGrosze}:${currency.toUpperCase()}`;
}

function normalizeMethodRecord(raw: unknown): P24PaymentMethodRecord | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as { id?: unknown; name?: unknown; group?: unknown };
  const id = parseP24MethodId(candidate.id);

  if (!id) {
    return null;
  }

  const name =
    typeof candidate.name === "string" && candidate.name.trim().length > 0
      ? candidate.name.trim()
      : String(id);

  const group =
    typeof candidate.group === "string" && candidate.group.trim().length > 0
      ? candidate.group.trim()
      : "Another";

  return { id, name, group };
}

export async function fetchP24PaymentMethods(
  p24Api: P24ApiService,
  params: {
    lang: string;
    amountGrosze: number;
    currency: string;
  },
): Promise<P24PaymentMethodRecord[]> {
  const lang = params.lang.toLowerCase();
  const currency = params.currency.toUpperCase();
  const amountGrosze = Math.max(0, Math.trunc(params.amountGrosze));
  const cacheKey = buildMethodsCacheKey(lang, amountGrosze, currency);
  const cached = methodsCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.methods;
  }

  const response = await p24Api.getPaymentMethods(lang, amountGrosze, currency);
  const rawMethods = Array.isArray(response.data) ? response.data : [];
  const methods = rawMethods
    .map(normalizeMethodRecord)
    .filter((method): method is P24PaymentMethodRecord => method != null);

  methodsCache.set(cacheKey, {
    expiresAt: Date.now() + METHODS_CACHE_TTL_MS,
    methods,
  });

  return methods;
}

export async function resolveP24PaymentMethodMetadata(
  p24Api: P24ApiService,
  params: {
    methodId: number;
    lang: string;
    amountGrosze: number;
    currency: string;
    providerKey?: string;
  },
): Promise<P24PaymentMethodMetadata> {
  const methods = await fetchP24PaymentMethods(p24Api, params).catch(
    () => [] as P24PaymentMethodRecord[],
  );
  const match = methods.find((method) => method.id === params.methodId);

  if (match) {
    return {
      paymentMethod: match.id,
      paymentMethodName: match.name,
      paymentMethodGroup: match.group,
    };
  }

  const fallback = getProviderMethodFallback(params.providerKey);

  return {
    paymentMethod: params.methodId,
    paymentMethodName: fallback.paymentMethodName ?? String(params.methodId),
    paymentMethodGroup: fallback.paymentMethodGroup ?? "Another",
  };
}

function getProviderMethodFallback(
  providerKey: string | undefined,
): Partial<P24PaymentMethodMetadata> {
  switch (providerKey) {
    case PaymentProviderKeys.P24_BLIK:
      return {
        paymentMethodName: "blik",
        paymentMethodGroup: "Blik",
      };
    case PaymentProviderKeys.P24_CARDS:
      return {
        paymentMethodName: "card",
        paymentMethodGroup: "Credit Card",
      };
    case PaymentProviderKeys.P24_VISA_MOBILE:
      return {
        paymentMethodName: "visa-mobile",
        paymentMethodGroup: "Wallet",
      };
    default:
      return {};
  }
}

export function extractMethodIdFromSessionData(
  data?: Record<string, unknown> | null,
): number | undefined {
  if (!data) {
    return undefined;
  }

  return (
    parseP24MethodId(data.methodId) ??
    parseP24MethodId(data.method_id) ??
    parseP24MethodId(data.paymentMethod)
  );
}
