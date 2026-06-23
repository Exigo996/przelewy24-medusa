"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
async function GET(req, res) {
    const logger = req.scope.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const { sessionId, status } = req.query;
    try {
        logger.info(`P24 payment return: sessionId=${sessionId}, status=${status}`);
        // Redirect to frontend with payment result
        const redirectUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const returnUrl = `${redirectUrl}/payment/return?session_id=${sessionId}&status=${status}`;
        res.redirect(302, returnUrl);
    }
    catch (error) {
        logger.error(`Error handling P24 return: ${error?.message || "Unknown error"}`);
        // Redirect to error page
        const redirectUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const errorUrl = `${redirectUrl}/payment/error`;
        res.redirect(302, errorUrl);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3JldHVybi9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLGtCQTBCQztBQTVCRCxxREFBc0U7QUFFL0QsS0FBSyxVQUFVLEdBQUcsQ0FDdkIsR0FBa0IsRUFDbEIsR0FBbUI7SUFFbkIsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0lBRXhDLElBQUksQ0FBQztRQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsaUNBQWlDLFNBQVMsWUFBWSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLDJDQUEyQztRQUMzQyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSx1QkFBdUIsQ0FBQztRQUN4RSxNQUFNLFNBQVMsR0FBRyxHQUFHLFdBQVcsOEJBQThCLFNBQVMsV0FBVyxNQUFNLEVBQUUsQ0FBQztRQUUzRixHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixNQUFNLENBQUMsS0FBSyxDQUNWLDhCQUE4QixLQUFLLEVBQUUsT0FBTyxJQUFJLGVBQWUsRUFBRSxDQUNsRSxDQUFDO1FBRUYseUJBQXlCO1FBQ3pCLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLHVCQUF1QixDQUFDO1FBQ3hFLE1BQU0sUUFBUSxHQUFHLEdBQUcsV0FBVyxnQkFBZ0IsQ0FBQztRQUVoRCxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM5QixDQUFDO0FBQ0gsQ0FBQyJ9