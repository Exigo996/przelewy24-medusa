"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const p24_base_1 = __importDefault(require("../core/p24-base"));
const types_1 = require("../types");
const coerce_sandbox_1 = require("../../../utils/coerce-sandbox");
class P24BlikService extends p24_base_1.default {
    static identifier = types_1.PaymentProviderKeys.P24_BLIK;
    blikOptions_;
    constructor(cradle, options) {
        const normalizedOptions = {
            ...options,
            sandbox: (0, coerce_sandbox_1.coerceSandbox)(options.sandbox),
            channel: options.channel ?? types_1.DEFAULT_BLIK_CHANNEL,
            white_label: options.white_label ?? true,
        };
        super(cradle, normalizedOptions);
        this.blikOptions_ = normalizedOptions;
    }
    get paymentIntentOptions() {
        return {
            channel: this.blikOptions_.channel ?? types_1.DEFAULT_BLIK_CHANNEL,
            description: "Payment via Przelewy24 - BLIK",
            white_label: this.blikOptions_.white_label ?? true,
        };
    }
    getProviderKey() {
        return types_1.PaymentProviderKeys.P24_BLIK;
    }
    async chargeBlikPayment(token, blikCode) {
        return this.p24Api.chargeBlikByCode({
            token,
            blikCode,
        });
    }
}
exports.default = P24BlikService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LWJsaWsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3ByemVsZXd5MjQvc2VydmljZXMvcDI0LWJsaWsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnRUFBdUM7QUFDdkMsb0NBS2tCO0FBQ2xCLGtFQUE4RDtBQUU5RCxNQUFNLGNBQWUsU0FBUSxrQkFBTztJQUNsQyxNQUFNLENBQUMsVUFBVSxHQUFHLDJCQUFtQixDQUFDLFFBQVEsQ0FBQztJQUVoQyxZQUFZLENBQWM7SUFFM0MsWUFBWSxNQUErQixFQUFFLE9BQW9CO1FBQy9ELE1BQU0saUJBQWlCLEdBQWdCO1lBQ3JDLEdBQUcsT0FBTztZQUNWLE9BQU8sRUFBRSxJQUFBLDhCQUFhLEVBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUN2QyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sSUFBSSw0QkFBb0I7WUFDaEQsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXLElBQUksSUFBSTtTQUN6QyxDQUFDO1FBRUYsS0FBSyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsaUJBQWlCLENBQUM7SUFDeEMsQ0FBQztJQUVELElBQUksb0JBQW9CO1FBQ3RCLE9BQU87WUFDTCxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLElBQUksNEJBQW9CO1lBQzFELFdBQVcsRUFBRSwrQkFBK0I7WUFDNUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxJQUFJLElBQUk7U0FDbkQsQ0FBQztJQUNKLENBQUM7SUFFUyxjQUFjO1FBQ3RCLE9BQU8sMkJBQW1CLENBQUMsUUFBUSxDQUFDO0lBQ3RDLENBQUM7SUFFRCxLQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBYSxFQUFFLFFBQWdCO1FBQ3JELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztZQUNsQyxLQUFLO1lBQ0wsUUFBUTtTQUNULENBQUMsQ0FBQztJQUNMLENBQUM7O0FBR0gsa0JBQWUsY0FBYyxDQUFDIn0=