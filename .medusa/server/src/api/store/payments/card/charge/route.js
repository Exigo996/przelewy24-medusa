"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const zod_1 = require("zod");
const charge_helper_1 = require("../../utils/charge-helper");
const types_1 = require("../../../../../providers/przelewy24/types");
const p24_session_data_1 = require("../../../../../utils/p24-session-data");
const CARDS_PROVIDER_ID = `pp_${types_1.PaymentProviderKeys.P24_CARDS}_przelewy24`;
const cardRegisterSchema = zod_1.z.object({
    ref_id: zod_1.z.string().min(1, "Card reference id is required").max(200),
    payment_session_id: zod_1.z.string().min(1, "Payment session id is required"),
});
async function POST(req, res) {
    const validationResult = cardRegisterSchema.safeParse(req.body);
    if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
        return res.status(400).json({
            error: "Validation failed",
            details: errors,
        });
    }
    const { ref_id, payment_session_id } = validationResult.data;
    try {
        const paymentModule = req.scope.resolve(utils_1.Modules.PAYMENT);
        const paymentSession = await paymentModule.retrievePaymentSession(payment_session_id);
        (0, charge_helper_1.assertPaymentSessionProvider)(paymentSession, CARDS_PROVIDER_ID);
        const provider = (0, charge_helper_1.resolveP24Provider)(req, types_1.PaymentProviderKeys.P24_CARDS);
        const result = await provider.registerWithRefId({
            refId: ref_id,
            input: {
                amount: paymentSession.amount,
                currency_code: paymentSession.currency_code,
                context: {
                    idempotency_key: (0, charge_helper_1.resolvePaymentSessionIdempotencyKey)(paymentSession),
                },
                data: {
                    ...(paymentSession.data ?? {}),
                    regulation_accept: true,
                },
            },
        });
        await paymentModule.updatePaymentSession({
            id: payment_session_id,
            amount: paymentSession.amount,
            currency_code: paymentSession.currency_code,
            data: (0, p24_session_data_1.normalizeP24SessionData)({
                ...(paymentSession.data ?? {}),
                ...(result.sessionData ?? {}),
                pending_card_tokenization: false,
                token: result.token,
            }),
        });
        return res.status(200).json({
            success: true,
            token: result.token,
            chargeScriptUrl: result.chargeScriptUrl,
            sessionId: result.sessionId,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Card payment failed";
        return res.status(400).json({
            error: "Card payment failed",
            message,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3BheW1lbnRzL2NhcmQvY2hhcmdlL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBb0JBLG9CQXNFQztBQXpGRCxxREFBb0Q7QUFDcEQsNkJBQXdCO0FBR3hCLDZEQUltQztBQUNuQyxxRUFBZ0Y7QUFDaEYsNEVBQWdGO0FBRWhGLE1BQU0saUJBQWlCLEdBQUcsTUFBTSwyQkFBbUIsQ0FBQyxTQUFTLGFBQWEsQ0FBQztBQUUzRSxNQUFNLGtCQUFrQixHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDbEMsTUFBTSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLCtCQUErQixDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUNuRSxrQkFBa0IsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxnQ0FBZ0MsQ0FBQztDQUN4RSxDQUFDLENBQUM7QUFFSSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsTUFBTSxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWhFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QixNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDOUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUNqRCxDQUFDO1FBRUYsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZ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