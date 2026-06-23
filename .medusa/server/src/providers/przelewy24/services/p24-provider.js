"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const p24_base_1 = __importDefault(require("../core/p24-base"));
const types_1 = require("../types");
class P24ProviderService extends p24_base_1.default {
    static identifier = types_1.PaymentProviderKeys.P24_PROVIDER;
    constructor(cradle, options) {
        super(cradle, options);
    }
    get paymentIntentOptions() {
        return {
            description: "Payment via Przelewy24 - All payment methods",
        };
    }
    getProviderKey() {
        return types_1.PaymentProviderKeys.P24_PROVIDER;
    }
}
exports.default = P24ProviderService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9wcnplbGV3eTI0L3NlcnZpY2VzL3AyNC1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdFQUF1QztBQUN2QyxvQ0FJa0I7QUFFbEIsTUFBTSxrQkFBbUIsU0FBUSxrQkFBTztJQUN0QyxNQUFNLENBQUMsVUFBVSxHQUFHLDJCQUFtQixDQUFDLFlBQVksQ0FBQztJQUVyRCxZQUFZLE1BQStCLEVBQUUsT0FBbUI7UUFDOUQsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBSSxvQkFBb0I7UUFDdEIsT0FBTztZQUNMLFdBQVcsRUFBRSw4Q0FBOEM7U0FDNUQsQ0FBQztJQUNKLENBQUM7SUFFUyxjQUFjO1FBQ3RCLE9BQU8sMkJBQW1CLENBQUMsWUFBWSxDQUFDO0lBQzFDLENBQUM7O0FBR0gsa0JBQWUsa0JBQWtCLENBQUMifQ==