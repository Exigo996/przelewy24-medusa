"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const zod_1 = require("zod");
const charge_helper_1 = require("../../utils/charge-helper");
const types_1 = require("../../../../../providers/przelewy24/types");
const statusSchema = zod_1.z.object({
    session_id: zod_1.z.string().min(1),
    provider_key: zod_1.z.nativeEnum(types_1.PaymentProviderKeys).optional(),
    provider_id: zod_1.z.string().min(1).optional(),
});
async function POST(req, res) {
    const validationResult = statusSchema.safeParse(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            error: "Validation failed",
            details: validationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
        });
    }
    const { session_id, provider_key, provider_id } = validationResult.data;
    try {
        const providerKey = (0, charge_helper_1.resolveP24ProviderKeyForStatus)({
            provider_key,
            provider_id,
        });
        const provider = (0, charge_helper_1.resolveP24Provider)(req, providerKey);
        const { medusaStatus, p24Status } = await provider.queryTransactionStatus(session_id);
        return res.status(200).json({
            session_id,
            p24_status: p24Status,
            status: medusaStatus,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to query transaction status";
        return res.status(400).json({
            error: "Failed to query transaction status",
            message,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3BheW1lbnRzL3RyYW5zYWN0aW9uL3N0YXR1cy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWdCQSxvQkEyQ0M7QUExREQsNkJBQXdCO0FBRXhCLDZEQUltQztBQUNuQyxxRUFBZ0Y7QUFFaEYsTUFBTSxZQUFZLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUM1QixVQUFVLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDN0IsWUFBWSxFQUFFLE9BQUMsQ0FBQyxVQUFVLENBQUMsMkJBQW1CLENBQUMsQ0FBQyxRQUFRLEVBQUU7SUFDMUQsV0FBVyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0NBQzFDLENBQUMsQ0FBQztBQUVJLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTFELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFCLEtBQUssRUFBRSxtQkFBbUI7WUFDMUIsT0FBTyxFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUN4QyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQ2pEO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU0sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQztJQUV4RSxJQUFJLENBQUM7UUFDSCxNQUFNLFdBQVcsR0FBRyxJQUFBLDhDQUE4QixFQUFDO1lBQ2pELFlBQVk7WUFDWixXQUFXO1NBQ1osQ0FBQyxDQUFDO1FBRUgsTUFBTSxRQUFRLEdBQUcsSUFBQSxrQ0FBa0IsRUFDakMsR0FBRyxFQUNILFdBQVcsQ0FDWixDQUFDO1FBRUYsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxzQkFBc0IsQ0FDdkUsVUFBVSxDQUNYLENBQUM7UUFFRixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFCLFVBQVU7WUFDVixVQUFVLEVBQUUsU0FBUztZQUNyQixNQUFNLEVBQUUsWUFBWTtTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE1BQU0sT0FBTyxHQUNYLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLG9DQUFvQyxDQUFDO1FBRWhGLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDMUIsS0FBSyxFQUFFLG9DQUFvQztZQUMzQyxPQUFPO1NBQ1IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztBQUNILENBQUMifQ==