"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseP24MethodId = parseP24MethodId;
exports.fetchP24PaymentMethods = fetchP24PaymentMethods;
exports.resolveP24PaymentMethodMetadata = resolveP24PaymentMethodMetadata;
exports.extractMethodIdFromSessionData = extractMethodIdFromSessionData;
const types_1 = require("../providers/przelewy24/types");
const METHODS_CACHE_TTL_MS = 15 * 60 * 1000;
const METHODS_CACHE_MAX_ENTRIES = 500;
const methodsCache = new Map();
function pruneMethodsCache(now) {
    for (const [key, entry] of methodsCache.entries()) {
        if (entry.expiresAt <= now) {
            methodsCache.delete(key);
        }
    }
    while (methodsCache.size > METHODS_CACHE_MAX_ENTRIES) {
        const oldestKey = methodsCache.keys().next().value;
        if (!oldestKey) {
            break;
        }
        methodsCache.delete(oldestKey);
    }
}
function parseP24MethodId(value) {
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
function buildMethodsCacheKey(lang, amountGrosze, currency) {
    return `${lang.toLowerCase()}:${amountGrosze}:${currency.toUpperCase()}`;
}
function normalizeMethodRecord(raw) {
    if (!raw || typeof raw !== "object") {
        return null;
    }
    const candidate = raw;
    const id = parseP24MethodId(candidate.id);
    if (!id) {
        return null;
    }
    const name = typeof candidate.name === "string" && candidate.name.trim().length > 0
        ? candidate.name.trim()
        : String(id);
    const group = typeof candidate.group === "string" && candidate.group.trim().length > 0
        ? candidate.group.trim()
        : "Another";
    return { id, name, group };
}
async function fetchP24PaymentMethods(p24Api, params) {
    const now = Date.now();
    pruneMethodsCache(now);
    const lang = params.lang.toLowerCase();
    const currency = params.currency.toUpperCase();
    const amountGrosze = Math.max(0, Math.trunc(params.amountGrosze));
    const cacheKey = buildMethodsCacheKey(lang, amountGrosze, currency);
    const cached = methodsCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
        return cached.methods;
    }
    const response = await p24Api.getPaymentMethods(lang, amountGrosze, currency);
    const rawMethods = Array.isArray(response.data) ? response.data : [];
    const methods = rawMethods
        .map(normalizeMethodRecord)
        .filter((method) => method != null);
    methodsCache.set(cacheKey, {
        expiresAt: now + METHODS_CACHE_TTL_MS,
        methods,
    });
    return methods;
}
async function resolveP24PaymentMethodMetadata(p24Api, params) {
    const methods = await fetchP24PaymentMethods(p24Api, params).catch(() => []);
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
function getProviderMethodFallback(providerKey) {
    switch (providerKey) {
        case types_1.PaymentProviderKeys.P24_BLIK:
            return {
                paymentMethodName: "blik",
                paymentMethodGroup: "Blik",
            };
        case types_1.PaymentProviderKeys.P24_CARDS:
            return {
                paymentMethodName: "card",
                paymentMethodGroup: "Credit Card",
            };
        case types_1.PaymentProviderKeys.P24_VISA_MOBILE:
            return {
                paymentMethodName: "visa-mobile",
                paymentMethodGroup: "Wallet",
            };
        default:
            return {};
    }
}
function extractMethodIdFromSessionData(data) {
    if (!data) {
        return undefined;
    }
    return (parseP24MethodId(data.methodId) ??
        parseP24MethodId(data.method_id) ??
        parseP24MethodId(data.paymentMethod));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LXBheW1lbnQtbWV0aG9kcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlscy9wMjQtcGF5bWVudC1tZXRob2RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBd0NBLDRDQWFDO0FBbUNELHdEQWlDQztBQUVELDBFQThCQztBQTBCRCx3RUFZQztBQTlMRCx5REFBb0U7QUFtQnBFLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDNUMsTUFBTSx5QkFBeUIsR0FBRyxHQUFHLENBQUM7QUFDdEMsTUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQTZCLENBQUM7QUFFMUQsU0FBUyxpQkFBaUIsQ0FBQyxHQUFXO0lBQ3BDLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUNsRCxJQUFJLEtBQUssQ0FBQyxTQUFTLElBQUksR0FBRyxFQUFFLENBQUM7WUFDM0IsWUFBWSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQixDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sWUFBWSxDQUFDLElBQUksR0FBRyx5QkFBeUIsRUFBRSxDQUFDO1FBQ3JELE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDbkQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2YsTUFBTTtRQUNSLENBQUM7UUFDRCxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBYztJQUM3QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FB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