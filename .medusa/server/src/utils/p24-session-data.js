"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferMedusaPaymentSessionIdFromP24SessionId = inferMedusaPaymentSessionIdFromP24SessionId;
exports.getSessionId = getSessionId;
exports.getOrderId = getOrderId;
exports.getToken = getToken;
exports.normalizeP24SessionData = normalizeP24SessionData;
const MEDUSA_PAYMENT_SESSION_ID_WITH_RETRY_SUFFIX = /^(payses_[0-9A-Z]{26})(?:-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})?$/i;
/**
 * P24 transaction sessionId is usually the Medusa payment session id (`payses_*`).
 * Retried payments append a UUID suffix after updatePayment.
 */
function inferMedusaPaymentSessionIdFromP24SessionId(p24SessionId) {
    const match = p24SessionId.match(MEDUSA_PAYMENT_SESSION_ID_WITH_RETRY_SUFFIX);
    return match?.[1];
}
function getSessionId(data) {
    if (!data) {
        return undefined;
    }
    const sessionId = data.session_id ?? data.sessionId;
    return typeof sessionId === "string" && sessionId.length > 0
        ? sessionId
        : undefined;
}
function getOrderId(data) {
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
function getToken(data) {
    if (!data) {
        return undefined;
    }
    const token = data.token;
    return typeof token === "string" && token.length > 0 ? token : undefined;
}
function normalizeP24SessionData(data) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LXNlc3Npb24tZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlscy9wMjQtc2Vzc2lvbi1kYXRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBT0Esa0dBS0M7QUFjRCxvQ0FTQztBQUVELGdDQWdCQztBQUVELDRCQU9DO0FBRUQsMERBb0JDO0FBcEZELE1BQU0sMkNBQTJDLEdBQy9DLDRGQUE0RixDQUFDO0FBRS9GOzs7R0FHRztBQUNILFNBQWdCLDJDQUEyQyxDQUN6RCxZQUFvQjtJQUVwQixNQUFNLEtBQUssR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7SUFDOUUsT0FBTyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixDQUFDO0FBY0QsU0FBZ0IsWUFBWSxDQUFDLElBQXFDO0lBQ2hFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNWLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDcEQsT0FBTyxPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQzFELENBQUMsQ0FBQyxTQUFTO1FBQ1gsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQXFDO0lBQzlELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNWLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDOUMsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQzVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzdELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQixPQUFPLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3RELENBQUM7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBZ0IsUUFBUSxDQUFDLElBQXFDO0lBQzVELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNWLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3pCLE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUMzRSxDQUFDO0FBRUQsU0FBZ0IsdUJBQXVCLENBQ3JDLElBQXFDO0lBRXJDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVELE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQyxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakMsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTdCLE9BQU87UUFDTCxHQUFHLElBQUk7UUFDUCxVQUFVLEVBQUUsU0FBUyxJQUFJLEVBQUU7UUFDM0IsR0FBRyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFELEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMzQixHQUFHLENBQUMsT0FBTyxJQUFJLENBQUMsUUFBUSxLQUFLLFFBQVE7WUFDbkMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDM0QsQ0FBQyxDQUFDLEVBQUUsQ0FBQztLQUNSLENBQUM7QUFDSixDQUFDIn0=