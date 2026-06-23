"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const get_smallest_unit_1 = require("../../../utils/get-smallest-unit");
const p24_session_data_1 = require("../../../utils/p24-session-data");
const p24_base_1 = __importDefault(require("../core/p24-base"));
const types_1 = require("../types");
const coerce_sandbox_1 = require("../../../utils/coerce-sandbox");
class P24CardsService extends p24_base_1.default {
    static identifier = types_1.PaymentProviderKeys.P24_CARDS;
    cardsOptions_;
    constructor(cradle, options) {
        const normalizedOptions = {
            ...options,
            sandbox: (0, coerce_sandbox_1.coerceSandbox)(options.sandbox),
            card_channel: options.card_channel ?? types_1.DEFAULT_CARD_CHANNEL,
            white_label: options.white_label ?? true,
        };
        super(cradle, normalizedOptions);
        this.cardsOptions_ = normalizedOptions;
    }
    get paymentIntentOptions() {
        return {
            channel: this.cardsOptions_.card_channel ?? types_1.DEFAULT_CARD_CHANNEL,
            description: "Payment via Przelewy24 - Credit/Debit Cards",
            white_label: this.cardsOptions_.white_label ?? true,
        };
    }
    getProviderKey() {
        return types_1.PaymentProviderKeys.P24_CARDS;
    }
    async initiatePayment(input) {
        const sessionId = input.context?.idempotency_key;
        const p24SessionId = input.data?.p24_session_id || sessionId;
        const cardRefId = typeof input.data?.card_ref_id === "string"
            ? input.data.card_ref_id
            : undefined;
        if (!cardRefId) {
            if (!sessionId || !p24SessionId) {
                throw this.buildError("Missing idempotency key for P24 card session", new Error("idempotency_key is required"));
            }
            const transactionRequest = this.buildTransactionRequest(input, p24SessionId);
            const tokenizationSign = this.p24Api.generateCardTokenizationSign(p24SessionId);
            const amountGrosze = (0, get_smallest_unit_1.getSmallestUnit)(Number(input.amount), input.currency_code);
            const psu = input.data?.psu &&
                typeof input.data.psu === "object" &&
                typeof input.data.psu.IP === "string" &&
                typeof input.data.psu.userAgent ===
                    "string"
                ? input.data.psu
                : undefined;
            return {
                id: p24SessionId,
                data: (0, p24_session_data_1.normalizeP24SessionData)({
                    session_id: p24SessionId,
                    // Persist the P24 session id so the later transaction/register
                    // (POST /card/charge) reuses the exact session the widget tokenized
                    // against, regardless of the Medusa payment session idempotency key.
                    p24_session_id: p24SessionId,
                    medusa_payment_session_id: sessionId,
                    merchant_id: parseInt(this.options_.merchant_id),
                    card_tokenization_sign: tokenizationSign,
                    pending_card_tokenization: true,
                    white_label: true,
                    amount: Number(input.amount),
                    amount_grosze: amountGrosze,
                    currency: input.currency_code,
                    currency_code: input.currency_code,
                    description: transactionRequest.description,
                    email: transactionRequest.email,
                    country: transactionRequest.country,
                    language: transactionRequest.language,
                    channel: transactionRequest.channel,
                    ...(psu ? { psu } : {}),
                }),
            };
        }
        return super.initiatePayment({
            ...input,
            data: {
                ...input.data,
                card_ref_id: cardRefId,
                regulation_accept: input.data?.regulation_accept === true ||
                    input.data?.regulationAccept === true,
            },
        });
    }
    async registerWithRefId({ refId, input, }) {
        const initiated = await this.initiatePayment({
            ...input,
            data: {
                ...input.data,
                card_ref_id: refId,
                regulation_accept: true,
            },
        });
        const token = typeof initiated.data?.token === "string" ? initiated.data.token : "";
        if (!token) {
            throw this.buildError("Missing P24 transaction token after card registration", new Error("token is required"));
        }
        return {
            token,
            chargeScriptUrl: this.p24Api.getCardWhitelabelScriptUrl(token),
            sessionId: typeof initiated.data?.session_id === "string"
                ? initiated.data.session_id
                : initiated.id,
            sessionData: initiated.data,
        };
    }
    /**
     * Build the data needed to render the P24 card tokenization iframe WITHOUT
     * creating a payment session or P24 transaction.
     *
     * The tokenization signature only depends on `merchantId + sessionId + crc`
     * (not the amount), so this is a pure, side-effect-free computation. The
     * returned `session_id` must later be passed back (as `p24_session_id`) when
     * the payment session is created so `transaction/register` reuses the same
     * P24 session the widget tokenized against.
     */
    createCardTokenizationIntent({ amount, currency_code, }) {
        const sessionId = (0, crypto_1.randomUUID)();
        return {
            merchant_id: parseInt(this.options_.merchant_id),
            session_id: sessionId,
            card_tokenization_sign: this.p24Api.generateCardTokenizationSign(sessionId),
            amount_grosze: (0, get_smallest_unit_1.getSmallestUnit)(Number(amount), currency_code),
            currency_code,
        };
    }
    getCardTokenizationScriptUrl() {
        return this.p24Api.getCardTokenizationScriptUrl();
    }
}
exports.default = P24CardsService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LWNhcmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9wcnplbGV3eTI0L3NlcnZpY2VzL3AyNC1jYXJkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG1DQUFvQztBQU9wQyx3RUFBbUU7QUFDbkUsc0VBQTBFO0FBQzFFLGdFQUF1QztBQUN2QyxvQ0FLa0I7QUFDbEIsa0VBQThEO0FBRTlELE1BQU0sZUFBZ0IsU0FBUSxrQkFBTztJQUNuQyxNQUFNLENBQUMsVUFBVSxHQUFHLDJCQUFtQixDQUFDLFNBQVMsQ0FBQztJQUVqQyxhQUFhLENBQWU7SUFFN0MsWUFBWSxNQUErQixFQUFFLE9BQXFCO1FBQ2hFLE1BQU0saUJBQWlCLEdBQWlCO1lBQ3RDLEdBQUcsT0FBTztZQUNWLE9BQU8sRUFBRSxJQUFBLDhCQUFhLEVBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUN2QyxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVksSUFBSSw0QkFBb0I7WUFDMUQsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFXLElBQUksSUFBSTtTQUN6QyxDQUFDO1FBRUYsS0FBSyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxhQUFhLEdBQUcsaUJBQWlCLENBQUM7SUFDekMsQ0FBQztJQUVELElBQUksb0JBQW9CO1FBQ3RCLE9BQU87WUFDTCxPQUFPLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLElBQUksNEJBQW9CO1lBQ2hFLFdBQVcsRUFBRSw2Q0FBNkM7WUFDMUQsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxJQUFJLElBQUk7U0FDcEQsQ0FBQztJQUNKLENBQUM7SUFFUyxjQUFjO1FBQ3RCLE9BQU8sMkJBQW1CLENBQUMsU0FBUyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUNuQixLQUEyQjtRQUUzQixN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