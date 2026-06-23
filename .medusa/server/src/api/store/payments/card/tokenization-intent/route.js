"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const zod_1 = require("zod");
const charge_helper_1 = require("../../utils/charge-helper");
const types_1 = require("../../../../../providers/przelewy24/types");
const tokenizationIntentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive("Amount must be greater than 0"),
    currency_code: zod_1.z
        .string()
        .min(1, "Currency code is required")
        .max(10, "Currency code is too long"),
});
/**
 * Returns the data required to render the P24 card tokenization iframe without
 * creating a payment session, payment collection, or P24 transaction.
 *
 * This lets the storefront mount the card widget the moment the customer
 * selects "Cards" (e.g. during order-change settlement) while deferring any
 * real commitment until the customer actually pays.
 */
async function POST(req, res) {
    const validationResult = tokenizationIntentSchema.safeParse(req.body);
    if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
        return res.status(400).json({
            error: "Validation failed",
            details: errors,
        });
    }
    const { amount, currency_code } = validationResult.data;
    try {
        const provider = (0, charge_helper_1.resolveP24Provider)(req, types_1.PaymentProviderKeys.P24_CARDS);
        const intent = provider.createCardTokenizationIntent({
            amount,
            currency_code,
        });
        return res.status(200).json(intent);
    }
    catch (error) {
        const logger = req.scope.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
        const message = error instanceof Error ? error.message : "Unknown error";
        logger.error(`[p24-card-tokenization-intent] ${message}`);
        return res.status(500).json({
            error: "Card tokenization intent failed",
            message: "Failed to create card tokenization intent",
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3BheW1lbnRzL2NhcmQvdG9rZW5pemF0aW9uLWludGVudC9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXdCQSxvQkF3Q0M7QUEvREQscURBQXNFO0FBQ3RFLDZCQUF3QjtBQUd4Qiw2REFBK0Q7QUFDL0QscUVBQWdGO0FBRWhGLE1BQU0sd0JBQXdCLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN4QyxNQUFNLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsQ0FBQztJQUM1RCxhQUFhLEVBQUUsT0FBQztTQUNiLE1BQU0sRUFBRTtTQUNSLEdBQUcsQ0FBQyxDQUFDLEVBQUUsMkJBQTJCLENBQUM7U0FDbkMsR0FBRyxDQUFDLEVBQUUsRUFBRSwyQkFBMkIsQ0FBQztDQUN4QyxDQUFDLENBQUM7QUFFSDs7Ozs7OztHQU9HO0FBQ0ksS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQ2hFLE1BQU0sZ0JBQWdCLEdBQUcsd0JBQXdCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV0RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUIsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQzlDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FDakQsQ0FBQztRQUVGLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUIsS0FBSyxFQUFFLG1CQUFtQjtZQUMxQixPQUFPLEVBQUUsTUFBTTtTQUNoQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7SUFFeEQsSUFBSSxDQUFDO1FBQ0gsTUFBTSxRQUFRLEdBQUcsSUFBQSxrQ0FBa0IsRUFDakMsR0FBRyxFQUNILDJCQUFtQixDQUFDLFNBQVMsQ0FDOUIsQ0FBQztRQUVGLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyw0QkFBNEIsQ0FBQztZQUNuRCxNQUFNO1lBQ04sYUFBYTtTQUNkLENBQUMsQ0FBQztRQUVILE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRSxNQUFNLE9BQU8sR0FDWCxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUM7UUFFM0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUUxRCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFCLEtBQUssRUFBRSxpQ0FBaUM7WUFDeEMsT0FBTyxFQUFFLDJDQUEyQztTQUNyRCxDQUFDLENBQUM7SUFDTCxDQUFDO0FBQ0gsQ0FBQyJ9