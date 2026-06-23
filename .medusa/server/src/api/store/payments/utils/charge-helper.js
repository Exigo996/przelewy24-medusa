"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markPaymentSessionError = markPaymentSessionError;
exports.parseP24ChargeResponse = parseP24ChargeResponse;
exports.handleP24Charge = handleP24Charge;
exports.resolvePaymentProviderById = resolvePaymentProviderById;
exports.assertPaymentSessionProvider = assertPaymentSessionProvider;
exports.resolvePaymentSessionIdempotencyKey = resolvePaymentSessionIdempotencyKey;
exports.assertBlikChargeMatchesPaymentSession = assertBlikChargeMatchesPaymentSession;
exports.resolveP24ProviderKeyForStatus = resolveP24ProviderKeyForStatus;
exports.resolveP24Provider = resolveP24Provider;
const utils_1 = require("@medusajs/framework/utils");
const p24_errors_1 = require("../../../../utils/p24-errors");
const types_1 = require("../../../../providers/przelewy24/types");
async function markPaymentSessionError(req, paymentSessionId, errorMessage) {
    const paymentModule = req.scope.resolve(utils_1.Modules.PAYMENT);
    const session = await paymentModule.retrievePaymentSession(paymentSessionId);
    await paymentModule.updatePaymentSession({
        id: paymentSessionId,
        amount: session.amount,
        currency_code: session.currency_code,
        status: utils_1.PaymentSessionStatus.ERROR,
        data: {
            ...(session.data ?? {}),
            error_message: errorMessage,
            failed_at: new Date().toISOString(),
        },
    });
}
function parseP24ChargeResponse(response) {
    if (response.responseCode !== 0) {
        throw new Error((0, p24_errors_1.buildLocalizedP24ErrorMessage)(response, (typeof response.data?.message === "string"
            ? response.data.message
            : response.message) || "Payment charge failed"));
    }
    return {
        orderId: typeof response.data?.orderId === "number"
            ? response.data.orderId
            : undefined,
        redirectUrl: typeof response.data?.redirectUrl === "string"
            ? response.data.redirectUrl
            : undefined,
        message: typeof response.data?.message === "string"
            ? response.data.message
            : undefined,
    };
}
async function handleP24Charge({ req, paymentSessionId, execute, }) {
    const logger = req.scope.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    try {
        const result = await execute();
        return {
            success: true,
            orderId: result.orderId,
            redirectUrl: result.redirectUrl,
            message: result.message,
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown payment charge error";
        logger.error(`[p24-charge] ${message}`);
        if (paymentSessionId) {
            await markPaymentSessionError(req, paymentSessionId, message).catch((markError) => {
                logger.error(`[p24-charge] Failed to mark payment session ${paymentSessionId} as error: ${markError instanceof Error ? markError.message : "unknown"}`);
            });
        }
        throw error;
    }
}
function resolvePaymentProviderById(container, providerId) {
    const paymentModule = container.resolve(utils_1.Modules.PAYMENT);
    return paymentModule.__container__.paymentProviderService.retrieveProvider(providerId);
}
function assertPaymentSessionProvider(session, expectedProviderId) {
    if (session.provider_id !== expectedProviderId) {
        throw new Error("Payment session provider mismatch");
    }
}
function resolvePaymentSessionIdempotencyKey(session) {
    const medusaPaymentSessionId = session.data?.medusa_payment_session_id;
    if (typeof medusaPaymentSessionId === "string" &&
        medusaPaymentSessionId.length > 0) {
        return medusaPaymentSessionId;
    }
    return session.id;
}
async function assertBlikChargeMatchesPaymentSession(req, paymentSessionId, token, expectedProviderId) {
    const paymentModule = req.scope.resolve(utils_1.Modules.PAYMENT);
    const session = await paymentModule.retrievePaymentSession(paymentSessionId);
    assertPaymentSessionProvider(session, expectedProviderId);
    const sessionToken = typeof session.data?.token === "string" ? session.data.token : undefined;
    if (!sessionToken || sessionToken !== token) {
        throw new Error("Payment session token mismatch");
    }
}
function isPaymentProviderKey(value) {
    return Object.values(types_1.PaymentProviderKeys).includes(value);
}
function resolveProviderKeyFromProviderId(providerId) {
    const match = providerId.match(/^pp_(.+)_przelewy24$/);
    if (match && isPaymentProviderKey(match[1])) {
        return match[1];
    }
    throw new Error("Unsupported payment provider");
}
function resolveP24ProviderKeyForStatus(input) {
    const providerKeyFromId = input.provider_id
        ? resolveProviderKeyFromProviderId(input.provider_id)
        : undefined;
    if (input.provider_key) {
        if (providerKeyFromId && providerKeyFromId !== input.provider_key) {
            throw new Error("Payment provider mismatch");
        }
        return input.provider_key;
    }
    if (providerKeyFromId) {
        return providerKeyFromId;
    }
    return types_1.PaymentProviderKeys.P24_BLIK;
}
function resolveP24Provider(req, providerKey) {
    const providerId = `pp_${providerKey}_przelewy24`;
    return resolvePaymentProviderById(req.scope, providerId);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcmdlLWhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9hcGkvc3RvcmUvcGF5bWVudHMvdXRpbHMvY2hhcmdlLWhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWlDQSwwREFtQkM7QUFFRCx3REE0QkM7QUFFRCwwQ0FvQ0M7QUFtQkQsZ0VBV0M7QUFFRCxvRUFPQztBQUVELGtGQWNDO0FBRUQsc0ZBaUJDO0FBeUNELHdFQXFCQztBQUVELGdEQU9DO0FBeFFELHFEQUltQztBQUNuQyw2REFBNkU7QUFDN0Usa0VBSWdEO0FBc0J6QyxLQUFLLFVBQVUsdUJBQXVCLENBQzNDLEdBQWtCLEVBQ2xCLGdCQUF3QixFQUN4QixZQUFvQjtJQUVwQixNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekQsTUFBTSxPQUFPLEdBQUcsTUFBTSxhQUFhLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUU3RSxNQUFNLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQztRQUN2QyxFQUFFLEVBQUUsZ0JBQWdCO1FBQ3BCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtRQUN0QixhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWE7UUFDcEMsTUFBTSxFQUFFLDRCQUFvQixDQUFDLEtBQUs7UUFDbEMsSUFBSSxFQUFFO1lBQ0osR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3ZCLGFBQWEsRUFBRSxZQUFZO1lBQzNCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUNwQztLQUNGLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFnQixzQkFBc0IsQ0FDcEMsUUFBMkI7SUFFM0IsSUFBSSxRQUFRLENBQUMsWUFBWSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2hD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