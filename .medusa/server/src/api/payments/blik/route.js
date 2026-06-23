"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const route_js_1 = require("../../store/payments/blik/charge/route.js");
/**
 * @deprecated Use POST /store/payments/blik/charge instead.
 */
async function POST(req, res) {
    const logger = req.scope.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    logger.warn("Deprecated route /payments/blik called. Use /store/payments/blik/charge instead.");
    return (0, route_js_1.POST)(req, res);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3BheW1lbnRzL2JsaWsvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFRQSxvQkFPQztBQWRELHFEQUFzRTtBQUV0RSx3RUFBc0Y7QUFFdEY7O0dBRUc7QUFDSSxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQWtCLEVBQUUsR0FBbUI7SUFDaEUsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkUsTUFBTSxDQUFDLElBQUksQ0FDVCxrRkFBa0YsQ0FDbkYsQ0FBQztJQUVGLE9BQU8sSUFBQSxlQUFpQixFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNyQyxDQUFDIn0=