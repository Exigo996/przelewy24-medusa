"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const zod_1 = require("zod");
const charge_helper_1 = require("../../utils/charge-helper");
const types_1 = require("../../../../../providers/przelewy24/types");
const BLIK_PROVIDER_ID = `pp_${types_1.PaymentProviderKeys.P24_BLIK}_przelewy24`;
const blikChargeSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required").max(200, "Token is too long"),
    blikCode: zod_1.z.string().regex(/^\d{6}$/, "BLIK code must be exactly 6 digits"),
    payment_session_id: zod_1.z
        .string()
        .min(1, "Payment session id is required"),
});
async function POST(req, res) {
    const validationResult = blikChargeSchema.safeParse(req.body);
    if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
        return res.status(400).json({
            error: "Validation failed",
            details: errors,
        });
    }
    const { token, blikCode, payment_session_id } = validationResult.data;
    try {
        await (0, charge_helper_1.assertBlikChargeMatchesPaymentSession)(req, payment_session_id, token, BLIK_PROVIDER_ID);
        const provider = (0, charge_helper_1.resolveP24Provider)(req, types_1.PaymentProviderKeys.P24_BLIK);
        const result = await (0, charge_helper_1.handleP24Charge)({
            req,
            paymentSessionId: payment_session_id,
            execute: async () => {
                const response = await provider.chargeBlikPayment(token, blikCode);
                return (0, charge_helper_1.parseP24ChargeResponse)(response);
            },
        });
        return res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "BLIK payment failed";
        return res.status(400).json({
            error: "BLIK payment failed",
            message,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3BheW1lbnRzL2JsaWsvY2hhcmdlL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBc0JBLG9CQWdEQztBQXJFRCw2QkFBd0I7QUFHeEIsNkRBS21DO0FBQ25DLHFFQUFnRjtBQUVoRixNQUFNLGdCQUFnQixHQUFHLE1BQU0sMkJBQW1CLENBQUMsUUFBUSxhQUFhLENBQUM7QUFFekUsTUFBTSxnQkFBZ0IsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQ2hDLEtBQUssRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsbUJBQW1CLENBQUM7SUFDM0UsUUFBUSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLG9DQUFvQyxDQUFDO0lBQzNFLGtCQUFrQixFQUFFLE9BQUM7U0FDbEIsTUFBTSxFQUFFO1NBQ1IsR0FBRyxDQUFDLENBQUMsRUFBRSxnQ0FBZ0MsQ0FBQztDQUM1QyxDQUFDLENBQUM7QUFFSSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsTUFBTSxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTlELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QixNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FDOUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUNqRCxDQUFDO1FBRUYsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMxQixLQUFLLEVBQUUsbUJBQW1CO1lBQzFCLE9BQU8sRUFBRSxNQUFNO1NBQ2hCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQztJQUV0RSxJQUFJLENBQUM7UUFDSCxNQUFNLElBQUEscURBQXFDLEVBQ3pDLEdBQUcsRUFDSCxrQkFBa0IsRUFDbEIsS0FBSyxFQUNMLGdCQUFnQixDQUNqQixDQUFDO1FBRUYsTUFBTSxRQUFRLEdBQUcsSUFBQSxrQ0FBa0IsRUFDakMsR0FBRyxFQUNILDJCQUFtQixDQUFDLFFBQVEsQ0FDN0IsQ0FBQztRQUVGLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSwrQkFBZSxFQUFDO1lBQ25DLEdBQUc7WUFDSCxnQkFBZ0IsRUFBRSxrQkFBa0I7WUFDcEMsT0FBTyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUNsQixNQUFNLFFBQVEsR0FBRyxNQUFNLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ25FLE9BQU8sSUFBQSxzQ0FBc0IsRUFBQyxRQUFRLENBQUMsQ0FBQztZQUMxQyxDQUFDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sT0FBTyxHQUNYLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBRWpFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUIsS0FBSyxFQUFFLHFCQUFxQjtZQUM1QixPQUFPO1NBQ1IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztBQUNILENBQUMifQ==