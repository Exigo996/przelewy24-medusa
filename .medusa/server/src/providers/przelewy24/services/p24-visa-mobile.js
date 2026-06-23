"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const p24_base_1 = __importDefault(require("../core/p24-base"));
const types_1 = require("../types");
const coerce_sandbox_1 = require("../../../utils/coerce-sandbox");
class P24VisaMobileService extends p24_base_1.default {
    static identifier = types_1.PaymentProviderKeys.P24_VISA_MOBILE;
    visaMobileOptions_;
    constructor(cradle, options) {
        const methodId = options.visa_mobile_method_id ?? types_1.DEFAULT_VISA_MOBILE_METHOD_ID;
        if (!Number.isFinite(methodId) || methodId <= 0) {
            throw new Error("Invalid `visa_mobile_method_id` in P24 Visa Mobile provider options");
        }
        const normalizedOptions = {
            ...options,
            sandbox: (0, coerce_sandbox_1.coerceSandbox)(options.sandbox),
            visa_mobile_method_id: methodId,
            white_label: options.white_label ?? false,
        };
        super(cradle, normalizedOptions);
        this.visaMobileOptions_ = normalizedOptions;
    }
    get paymentIntentOptions() {
        const options = {
            method_id: this.visaMobileOptions_.visa_mobile_method_id,
            description: "Payment via Przelewy24 - Visa Mobile",
            white_label: this.visaMobileOptions_.white_label ?? false,
        };
        if (this.visaMobileOptions_.channel != null &&
            this.visaMobileOptions_.channel > 0) {
            options.channel = this.visaMobileOptions_.channel;
        }
        return options;
    }
    getProviderKey() {
        return types_1.PaymentProviderKeys.P24_VISA_MOBILE;
    }
}
exports.default = P24VisaMobileService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LXZpc2EtbW9iaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9wcnplbGV3eTI0L3NlcnZpY2VzL3AyNC12aXNhLW1vYmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdFQUF1QztBQUN2QyxvQ0FLa0I7QUFDbEIsa0VBQThEO0FBRTlELE1BQU0sb0JBQXFCLFNBQVEsa0JBQU87SUFDeEMsTUFBTSxDQUFDLFVBQVUsR0FBRywyQkFBbUIsQ0FBQyxlQUFlLENBQUM7SUFFdkMsa0JBQWtCLENBQW9CO0lBRXZELFlBQVksTUFBK0IsRUFBRSxPQUEwQjtRQUNyRSxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMscUJBQXFCLElBQUkscUNBQTZCLENBQUM7UUFFaEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksUUFBUSxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ2hELE1BQU0sSUFBSSxLQUFLLENBQ2IscUVBQXFFLENBQ3RFLENBQUM7UUFDSixDQUFDO1FBRUQsTUFBTSxpQkFBaUIsR0FBc0I7WUFDM0MsR0FBRyxPQUFPO1lBQ1YsT0FBTyxFQUFFLElBQUEsOEJBQWEsRUFBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQ3ZDLHFCQUFxQixFQUFFLFFBQVE7WUFDL0IsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXLElBQUksS0FBSztTQUMxQyxDQUFDO1FBRUYsS0FBSyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQztJQUM5QyxDQUFDO0lBRUQsSUFBSSxvQkFBb0I7UUFDdEIsTUFBTSxPQUFPLEdBQTRCO1lBQ3ZDLFNBQVMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMscUJBQXFCO1lBQ3hELFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsV0FBVyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLElBQUksS0FBSztTQUMxRCxDQUFDO1FBRUYsSUFDRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxJQUFJLElBQUk7WUFDdkMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sR0FBRyxDQUFDLEVBQ25DLENBQUM7WUFDRCxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUM7UUFDcEQsQ0FBQztRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFUyxjQUFjO1FBQ3RCLE9BQU8sMkJBQW1CLENBQUMsZUFBZSxDQUFDO0lBQzdDLENBQUM7O0FBR0gsa0JBQWUsb0JBQW9CLENBQUMifQ==