"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.P24ApiService = exports.P24ApiError = void 0;
const crypto_1 = __importDefault(require("crypto"));
const coerce_sandbox_1 = require("../../../utils/coerce-sandbox");
const p24_errors_1 = require("../../../utils/p24-errors");
const p24_webhook_ips_1 = require("../../../utils/p24-webhook-ips");
class P24ApiError extends Error {
    responseCode;
    payload;
    constructor(message, responseCode, payload) {
        super(message);
        this.name = "P24ApiError";
        this.responseCode = responseCode;
        this.payload = payload;
    }
}
exports.P24ApiError = P24ApiError;
class P24ApiService {
    options;
    baseURL;
    constructor(options) {
        this.options = {
            ...options,
            sandbox: (0, coerce_sandbox_1.coerceSandbox)(options.sandbox),
        };
        this.baseURL = this.options.sandbox
            ? "https://sandbox.przelewy24.pl/api/v1"
            : "https://secure.przelewy24.pl/api/v1";
    }
    getBaseURL() {
        return this.baseURL;
    }
    /**
     * Register a new transaction with P24
     */
    async registerTransaction(data) {
        const requestData = {
            merchantId: parseInt(this.options.merchant_id),
            posId: parseInt(this.options.pos_id),
            sessionId: data.sessionId,
            amount: data.amount,
            currency: data.currency,
            description: data.description,
            email: data.email,
            country: data.country,
            language: data.language,
            urlReturn: data.urlReturn,
            urlStatus: data.urlStatus,
            sign: this.generateSign({
                sessionId: data.sessionId,
                merchantId: parseInt(this.options.merchant_id),
                amount: data.amount,
                currency: data.currency,
                crc: this.options.crc,
            }),
        };
        if (data.channel != null && data.channel > 0) {
            requestData.channel = data.channel;
        }
        if (data.method != null) {
            requestData.method = data.method;
        }
        if (data.regulationAccept === true) {
            requestData.regulationAccept = true;
        }
        if (data.cardData) {
            requestData.cardData = data.cardData;
        }
        if (data.additional) {
            requestData.additional = data.additional;
        }
        return this.makeRequest("/transaction/register", "POST", requestData);
    }
    /**
     * Verify a transaction with P24
     */
    async verifyTransaction(sessionId, amount, currency, orderId) {
        const data = {
            merchantId: parseInt(this.options.merchant_id),
            posId: parseInt(this.options.pos_id),
            sessionId,
            amount,
            currency,
            orderId,
            sign: this.generateVerificationSign({
                sessionId,
                orderId,
                amount,
                currency,
                crc: this.options.crc,
            }),
        };
        return this.makeRequest("/transaction/verify", "PUT", data);
    }
    /**
     * List available payment methods for amount/currency.
     */
    async getPaymentMethods(lang, amountGrosze, currency) {
        const params = new URLSearchParams({
            amount: String(Math.max(0, Math.trunc(amountGrosze))),
            currency: currency.toUpperCase(),
        });
        return this.makeRequest(`/payment/methods/${encodeURIComponent(lang.toLowerCase())}?${params.toString()}`, "GET");
    }
    /**
     * Get transaction details by session ID
     */
    async getTransactionBySessionId(sessionId) {
        const endpoint = `/transaction/by/sessionId/${encodeURIComponent(sessionId)}`;
        return this.makeRequest(endpoint, "GET");
    }
    /**
     * Process a refund
     */
    async processRefund(refundData) {
        return this.makeRequest("/transaction/refund", "POST", refundData);
    }
    /**
     * Charge payment using BLIK code
     */
    async chargeBlikByCode(data) {
        return this.makeRequest("/paymentMethod/blik/chargeByCode", "POST", {
            token: data.token,
            blikCode: data.blikCode,
        });
    }
    /**
     * Charge card with 3DS (white-label iframe flow)
     */
    async chargeCardWith3ds(token) {
        return this.makeRequest("/card/chargeWith3ds", "POST", { token });
    }
    /**
     * Charge card without 3DS redirect
     */
    async chargeCard(token) {
        return this.makeRequest("/card/charge", "POST", { token });
    }
    /**
     * Get card metadata for an order
     */
    async getCardInfo(orderId) {
        return this.makeRequest(`/card/info/${orderId}`, "GET");
    }
    /**
     * Make a generic request to P24 API
     */
    async makeRequest(endpoint, method, data) {
        const url = `${this.baseURL}${endpoint}`;
        const credentials = Buffer.from(`${this.options.pos_id}:${this.options.api_key}`).toString("base64");
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${credentials}`,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
        const responseText = await response.text();
        let parsed = {};
        if (responseText) {
            try {
                parsed = JSON.parse(responseText);
            }
            catch {
                parsed = { message: responseText };
            }
        }
        if (!response.ok) {
            throw new P24ApiError((0, p24_errors_1.buildLocalizedP24ErrorMessage)(parsed, `P24 API request failed: ${response.status} ${response.statusText}`), parsed?.responseCode, parsed);
        }
        return parsed;
    }
    /**
     * Generate signature for transaction registration
     */
    generateSign(data) {
        const jsonString = JSON.stringify(data, null, 0).replace(/\\\//g, "/");
        return crypto_1.default.createHash("sha384").update(jsonString, "utf8").digest("hex");
    }
    /**
     * Generate signature for transaction verification
     */
    generateVerificationSign(data) {
        const jsonString = JSON.stringify(data, null, 0).replace(/\\\//g, "/");
        return crypto_1.default.createHash("sha384").update(jsonString, "utf8").digest("hex");
    }
    secureCompareHex(expected, received) {
        const expectedBuf = Buffer.from(expected, "hex");
        const receivedBuf = Buffer.from(received, "hex");
        if (expectedBuf.length !== receivedBuf.length) {
            return false;
        }
        return crypto_1.default.timingSafeEqual(expectedBuf, receivedBuf);
    }
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, receivedSign) {
        const signData = {
            merchantId: parseInt(this.options.merchant_id),
            posId: parseInt(this.options.pos_id),
            sessionId: payload.sessionId,
            amount: payload.amount,
            originAmount: payload.originAmount,
            currency: payload.currency,
            orderId: payload.orderId,
            methodId: payload.methodId,
            statement: payload.statement,
            crc: this.options.crc,
        };
        const expectedSign = this.hashSignaturePayload(signData);
        return this.secureCompareHex(expectedSign, receivedSign);
    }
    verifyCardPaymentNotificationSignature(payload, receivedSign, isFailure = false) {
        const signData = isFailure
            ? {
                merchantId: parseInt(this.options.merchant_id),
                posId: parseInt(this.options.pos_id),
                sessionId: payload.sessionId,
                orderId: payload.orderId,
                amount: payload.amount,
                currency: payload.currency,
                status: payload.status,
                crc: this.options.crc,
            }
            : {
                merchantId: parseInt(this.options.merchant_id),
                posId: parseInt(this.options.pos_id),
                sessionId: payload.sessionId,
                orderId: payload.orderId,
                amount: payload.amount,
                currency: payload.currency,
                refId: payload.refId,
                bin: payload.bin,
                mask: payload.mask,
                cardType: payload.cardType,
                cardDate: payload.cardDate,
                hash: payload.hash,
                crc: this.options.crc,
            };
        const expectedSign = this.hashSignaturePayload(signData);
        return this.secureCompareHex(expectedSign, receivedSign);
    }
    isAllowedWebhookIp(ipAddress) {
        return (0, p24_webhook_ips_1.isAllowedP24WebhookSourceIp)(ipAddress, {
            sandbox: this.options.sandbox,
        });
    }
    hashSignaturePayload(payload) {
        const jsonString = JSON.stringify(payload, null, 0).replace(/\\\//g, "/");
        return crypto_1.default.createHash("sha384").update(jsonString, "utf8").digest("hex");
    }
    /**
     * Get base redirect URL for P24
     */
    getBaseRedirectURL() {
        return this.options.sandbox
            ? "https://sandbox.przelewy24.pl/trnRequest"
            : "https://secure.przelewy24.pl/trnRequest";
    }
    generateCardTokenizationSign(sessionId) {
        return this.hashSignaturePayload({
            merchantId: parseInt(this.options.merchant_id),
            sessionId,
            crc: this.options.crc,
        });
    }
    getCardTokenizationScriptUrl() {
        const base = this.options.sandbox
            ? "https://sandbox.przelewy24.pl"
            : "https://secure.przelewy24.pl";
        return `${base}/js/cardTokenizationIframe.min.js`;
    }
    getCardWhitelabelScriptUrl(token) {
        const base = this.options.sandbox
            ? "https://sandbox.przelewy24.pl"
            : "https://secure.przelewy24.pl";
        return `${base}/whitelabel/card/javascript/${encodeURIComponent(token)}`;
    }
    getCardWidgetScriptUrl(token) {
        const base = this.options.sandbox
            ? "https://sandbox.przelewy24.pl"
            : "https://secure.przelewy24.pl";
        return `${base}/inchtml/ajaxPayment/ajax.js?token=${encodeURIComponent(token)}`;
    }
}
exports.P24ApiService = P24ApiService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9wcm92aWRlcnMvcHJ6ZWxld3kyNC9zZXJ2aWNlcy9wMjQtYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9EQUE0QjtBQWtCNUIsa0VBQThEO0FBQzlELDBEQUEwRTtBQUMxRSxvRUFBNkU7QUFFN0UsTUFBYSxXQUFZLFNBQVEsS0FBSztJQUMzQixZQUFZLENBQVU7SUFDdEIsT0FBTyxDQUFXO0lBRTNCLFlBQVksT0FBZSxFQUFFLFlBQXFCLEVBQUUsT0FBaUI7UUFDbkUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxhQUFhLENBQUM7UUFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztDQUNGO0FBVkQsa0NBVUM7QUFFRCxNQUFhLGFBQWE7SUFDUCxPQUFPLENBQWE7SUFDcEIsT0FBTyxDQUFTO0lBRWpDLFlBQVksT0FBbUI7UUFDN0IsSUFBSSxDQUFDLE9BQU8sR0FBRztZQUNiLEdBQUcsT0FBTztZQUNWLE9BQU8sRUFBRSxJQUFBLDhCQUFhLEVBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztTQUN4QyxDQUFDO1FBQ0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU87WUFDakMsQ0FBQyxDQUFDLHNDQUFzQztZQUN4QyxDQUFDLENBQUMscUNBQXFDLENBQUM7SUFDNUMsQ0FBQztJQUVELFVBQVU7UUFDUixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLG1CQUFtQixDQUN2QixJQUFvQjtRQUVwQixNQUFNLFdBQVcsR0FBNEI7WUFDM0MsVUFBVSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMs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