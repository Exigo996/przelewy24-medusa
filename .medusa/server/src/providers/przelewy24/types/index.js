"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorIntentStatus = exports.ErrorCodes = exports.DEFAULT_VISA_MOBILE_METHOD_ID = exports.DEFAULT_BLIK_CHANNEL = exports.DEFAULT_CARD_CHANNEL = exports.P24_WEBHOOK_ALLOWED_IPS = exports.P24_WEBHOOK_ALLOWED_CIDRS = exports.PaymentProviderKeys = void 0;
var PaymentProviderKeys;
(function (PaymentProviderKeys) {
    PaymentProviderKeys["P24_PROVIDER"] = "p24-provider";
    PaymentProviderKeys["P24_BLIK"] = "p24-blik";
    PaymentProviderKeys["P24_CARDS"] = "p24-cards";
    PaymentProviderKeys["P24_VISA_MOBILE"] = "p24-visa-mobile";
})(PaymentProviderKeys || (exports.PaymentProviderKeys = PaymentProviderKeys = {}));
var p24_webhook_ips_1 = require("../../../utils/p24-webhook-ips");
Object.defineProperty(exports, "P24_WEBHOOK_ALLOWED_CIDRS", { enumerable: true, get: function () { return p24_webhook_ips_1.P24_WEBHOOK_ALLOWED_CIDRS; } });
Object.defineProperty(exports, "P24_WEBHOOK_ALLOWED_IPS", { enumerable: true, get: function () { return p24_webhook_ips_1.P24_WEBHOOK_ALLOWED_IPS; } });
exports.DEFAULT_CARD_CHANNEL = 4096;
exports.DEFAULT_BLIK_CHANNEL = 64;
exports.DEFAULT_VISA_MOBILE_METHOD_ID = 198;
exports.ErrorCodes = {
    PAYMENT_INTENT_UNEXPECTED_STATE: "payment_intent_unexpected_state",
};
exports.ErrorIntentStatus = {
    CANCELED: "canceled",
    SUCCEEDED: "succeeded",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3ByemVsZXd5MjQvdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBNlBBLElBQVksbUJBS1g7QUFMRCxXQUFZLG1CQUFtQjtJQUM3QixvREFBNkIsQ0FBQTtJQUM3Qiw0Q0FBcUIsQ0FBQTtJQUNyQiw4Q0FBdUIsQ0FBQTtJQUN2QiwwREFBbUMsQ0FBQTtBQUNyQyxDQUFDLEVBTFcsbUJBQW1CLG1DQUFuQixtQkFBbUIsUUFLOUI7QUFFRCxrRUFHd0M7QUFGdEMsNEhBQUEseUJBQXlCLE9BQUE7QUFDekIsMEhBQUEsdUJBQXVCLE9BQUE7QUFHWixRQUFBLG9CQUFvQixHQUFHLElBQUksQ0FBQztBQUM1QixRQUFBLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztBQUMxQixRQUFBLDZCQUE2QixHQUFHLEdBQUcsQ0FBQztBQUVwQyxRQUFBLFVBQVUsR0FBRztJQUN4QiwrQkFBK0IsRUFBRSxpQ0FBaUM7Q0FDMUQsQ0FBQztBQUVFLFFBQUEsaUJBQWlCLEdBQUc7SUFDL0IsUUFBUSxFQUFFLFVBQVU7SUFDcEIsU0FBUyxFQUFFLFdBQVc7Q0FDZCxDQUFDIn0=