"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractP24WebhookSourceIp = extractP24WebhookSourceIp;
exports.processP24Webhook = processP24Webhook;
const utils_1 = require("@medusajs/framework/utils");
const get_smallest_unit_1 = require("../../../utils/get-smallest-unit");
const p24_logger_1 = require("../../../utils/p24-logger");
const p24_transaction_status_1 = require("./p24-transaction-status");
function extractP24WebhookSourceIp(headers) {
    if (!headers) {
        return undefined;
    }
    const cfConnectingIpRaw = headers["cf-connecting-ip"] || headers["CF-Connecting-IP"];
    const cfConnectingIp = typeof cfConnectingIpRaw === "string" ? cfConnectingIpRaw.trim() : "";
    if (cfConnectingIp) {
        return cfConnectingIp;
    }
    const realIpRaw = headers["x-real-ip"] || headers["X-Real-IP"];
    const realIp = typeof realIpRaw === "string" ? realIpRaw.trim() : "";
    if (realIp) {
        return realIp;
    }
    const forwardedFor = headers["x-forwarded-for"] || headers["X-Forwarded-For"];
    if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
        const ips = forwardedFor
            .split(",")
            .map((ip) => ip.trim())
            .filter(Boolean);
        return ips.length > 0 ? ips[0] : undefined;
    }
    return undefined;
}
async function processP24Webhook(deps, webhookData) {
    const { data, rawData, headers } = webhookData;
    try {
        const payload = data;
        const { sessionId, orderId, amount, currency, sign } = payload;
        const sourceIp = extractP24WebhookSourceIp(headers);
        if (!deps.p24Api.isAllowedWebhookIp(sourceIp)) {
            deps.logger.error(`Rejected P24 webhook from unauthorized IP: ${sourceIp ?? "unknown"}`);
            return { action: utils_1.PaymentActions.NOT_SUPPORTED };
        }
        if (!deps.p24Api.verifyWebhookSignature(payload, sign)) {
            deps.logger.error(`Invalid webhook signature for session ${sessionId}`);
            return { action: utils_1.PaymentActions.NOT_SUPPORTED };
        }
        if (typeof currency !== "string" || !currency.trim()) {
            deps.logger.error(`Missing or invalid currency in webhook payload for session ${sessionId}`);
            return { action: utils_1.PaymentActions.NOT_SUPPORTED };
        }
        const amountNum = Number(amount);
        if (amount == null || !Number.isFinite(amountNum) || amountNum < 0) {
            deps.logger.error(`Missing or invalid amount in webhook payload for session ${sessionId}`);
            return { action: utils_1.PaymentActions.NOT_SUPPORTED };
        }
        const amountNormal = (0, get_smallest_unit_1.getAmountFromSmallestUnit)(amount, currency);
        const medusaPaymentSessionId = await deps.findMedusaPaymentSessionId(sessionId);
        const verification = await deps.p24Api.verifyTransaction(sessionId, amount, currency, orderId);
        if (verification.responseCode !== 0 ||
            verification.data.status !== "success") {
            deps.logger.error(`Transaction verification failed - responseCode: ${verification.responseCode}, status: ${verification.data.status}`);
            return {
                action: utils_1.PaymentActions.FAILED,
                data: {
                    session_id: medusaPaymentSessionId,
                    amount: amountNormal,
                },
            };
        }
        const { medusaStatus } = await (0, p24_transaction_status_1.fetchTransactionDetailsAndStatus)(deps, sessionId);
        const webhookResultData = {
            session_id: medusaPaymentSessionId,
            amount: amountNormal,
            order_id: orderId,
            methodId: payload.methodId,
            paymentMethod: payload.methodId,
        };
        switch (medusaStatus) {
            case "captured":
            case "authorized": {
                const alreadyCaptured = await deps.hasCapturedPayment(medusaPaymentSessionId);
                if (alreadyCaptured) {
                    deps.logger.info(`P24 webhook for session ${sessionId} already captured; skipping to avoid duplicate processing`);
                    return { action: utils_1.PaymentActions.NOT_SUPPORTED };
                }
                return {
                    action: utils_1.PaymentActions.SUCCESSFUL,
                    data: webhookResultData,
                };
            }
            case "pending":
                return {
                    action: utils_1.PaymentActions.PENDING,
                    data: webhookResultData,
                };
            case "canceled":
                return {
                    action: utils_1.PaymentActions.CANCELED,
                    data: webhookResultData,
                };
            case "error":
                return {
                    action: utils_1.PaymentActions.FAILED,
                    data: webhookResultData,
                };
            default:
                return {
                    action: utils_1.PaymentActions.NOT_SUPPORTED,
                    data: webhookResultData,
                };
        }
    }
    catch (error) {
        deps.logger.error(`Error processing P24 webhook: ${error.message} raw=${JSON.stringify((0, p24_logger_1.redactUnknown)(rawData))}`);
        try {
            const fallbackPayload = webhookData.data;
            const { sessionId, amount, currency } = fallbackPayload;
            const amountNumFallback = Number(amount);
            if (sessionId &&
                amount != null &&
                Number.isFinite(amountNumFallback) &&
                amountNumFallback >= 0 &&
                typeof currency === "string" &&
                currency.trim()) {
                const amountNormal = (0, get_smallest_unit_1.getAmountFromSmallestUnit)(amount, currency);
                return {
                    action: utils_1.PaymentActions.FAILED,
                    data: {
                        session_id: sessionId,
                        amount: amountNormal,
                    },
                };
            }
        }
        catch (fallbackError) {
            deps.logger.error(`Failed to extract fallback webhook data: ${fallbackError.message}`);
        }
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LXdlYmhvb2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3ByemVsZXd5MjQvY29yZS9wMjQtd2ViaG9vay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWFBLDhEQStCQztBQVVELDhDQTBKQztBQTVNRCxxREFBMkQ7QUFJM0Qsd0VBQTZFO0FBQzdFLDBEQUEyRTtBQUUzRSxxRUFBNEU7QUFFNUUsU0FBZ0IseUJBQXlCLENBQ3ZDLE9BQWlDO0lBRWpDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNiLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRCxNQUFNLGlCQUFpQixHQUNyQixPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUM3RCxNQUFNLGNBQWMsR0FDbEIsT0FBTyxpQkFBaUIsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDeEUsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUNuQixPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMvRCxNQUFNLE1BQU0sR0FBRyxPQUFPLFNBQVMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQ3JFLElBQUksTUFBTSxFQUFFLENBQUM7UUFDWCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDOUUsSUFBSSxPQUFPLFlBQVksS0FBSyxRQUFRLElB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