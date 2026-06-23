"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Przelewy24 (P24) Payment Module Provider for Medusa
 */
const utils_1 = require("@medusajs/framework/utils");
const p24_blik_1 = __importDefault(require("./services/p24-blik"));
const p24_cards_1 = __importDefault(require("./services/p24-cards"));
const p24_provider_1 = __importDefault(require("./services/p24-provider"));
const p24_visa_mobile_1 = __importDefault(require("./services/p24-visa-mobile"));
const services = [
    p24_blik_1.default,
    p24_cards_1.default,
    p24_provider_1.default,
    p24_visa_mobile_1.default,
];
exports.default = (0, utils_1.ModuleProvider)(utils_1.Modules.PAYMENT, {
    services,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3ByemVsZXd5MjQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7R0FFRztBQUNILHFEQUFvRTtBQUNwRSxtRUFBaUQ7QUFDakQscUVBQW1EO0FBQ25ELDJFQUF5RDtBQUN6RCxpRkFBOEQ7QUFFOUQsTUFBTSxRQUFRLEdBQUc7SUFDZixrQkFBYztJQUNkLG1CQUFlO0lBQ2Ysc0JBQWtCO0lBQ2xCLHlCQUFvQjtDQUNyQixDQUFDO0FBRUYsa0JBQWUsSUFBQSxzQkFBYyxFQUFDLGVBQU8sQ0FBQyxPQUFPLEVBQUU7SUFDN0MsUUFBUTtDQUNULENBQUMsQ0FBQyJ9