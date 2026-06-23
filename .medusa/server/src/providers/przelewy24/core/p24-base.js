"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const utils_1 = require("@medusajs/framework/utils");
const p24_api_1 = require("../services/p24-api");
const p24_transaction_status_1 = require("./p24-transaction-status");
const p24_webhook_1 = require("./p24-webhook");
const get_smallest_unit_1 = require("../../../utils/get-smallest-unit");
const coerce_sandbox_1 = require("../../../utils/coerce-sandbox");
const p24_session_data_1 = require("../../../utils/p24-session-data");
const p24_payment_methods_1 = require("../../../utils/p24-payment-methods");
const p24_logger_1 = require("../../../utils/p24-logger");
const p24_errors_1 = require("../../../utils/p24-errors");
const payment_job_errors_1 = require("../../../utils/payment-job-errors");
class P24Base extends utils_1.AbstractPaymentProvider {
    options_;
    p24Api;
    container_;
    logger_;
    static validateOptions(options) {
        if (!(0, utils_1.isDefined)(options.merchant_id)) {
            throw new Error("Required option `merchant_id` is missing in P24 plugin");
        }
        if (!(0, utils_1.isDefined)(options.pos_id)) {
            throw new Error("Required option `pos_id` is missing in P24 plugin");
        }
        if (!(0, utils_1.isDefined)(options.api_key)) {
            throw new Error("Required option `api_key` is missing in P24 plugin");
        }
        if (!(0, utils_1.isDefined)(options.crc)) {
            throw new Error("Required option `crc` is missing in P24 plugin");
        }
        if (!(0, utils_1.isDefined)(options.frontend_url)) {
            throw new Error("Required option `frontend_url` is missing in P24 plugin");
        }
        if (!(0, utils_1.isDefined)(options.backend_url)) {
            throw new Error("Required option `backend_url` is missing in P24 plugin");
        }
    }
    constructor(cradle, options) {
        super(cradle, {
            ...options,
            sandbox: (0, coerce_sandbox_1.coerceSandbox)(options.sandbox),
        });
        this.container_ = cradle;
        this.options_ = {
            ...options,
            sandbox: (0, coerce_sandbox_1.coerceSandbox)(options.sandbox),
            debug: Boolean(options.debug),
        };
        this.p24Api = new p24_api_1.P24ApiService(this.options_);
        this.logger_ = (0, p24_logger_1.createP24Logger)(cradle.logger, Boolean(this.options_.debug));
    }
    get options() {
        return this.options_;
    }
    normalizePaymentCreateParams() {
        const options = this.paymentIntentOptions;
        const params = {
            description: options.description ?? "Payment via Przelewy24",
        };
        if (options.channel != null && options.channel > 0) {
            params.channel = options.channel;
        }
        if (options.method_id != null) {
            params.method = options.method_id;
        }
        return params;
    }
    buildTransactionRequest(input, sessionId) {
        const { currency_code, amount, data, context } = input;
        const normalizedParams = this.normalizePaymentCreateParams();
        const customerEmail = context?.customer?.email ||
            (typeof data?.email === "string" && data.email.trim().length > 0
                ? data.email.trim()
                : undefined) ||
            data?.customer?.email ||
            "customer@example.com";
        const country = data?.country?.toUpperCase() || "PL";
        const language = data?.language?.toLowerCase() || "pl";
        const urlReturn = typeof data?.return_url === "string" && data.return_url.trim().length
            ? data.return_url
            : `${this.options_.frontend_url}/payment/return?cart_id=${data?.cart_id ?? ""}`;
        const psu = data?.psu;
        const regulationAccept = data?.regulation_accept === true || data?.regulationAccept === true;
        const cardRefId = typeof data?.card_ref_id === "string" ? data.card_ref_id : undefined;
        const transactionRequest = {
            sessionId,
            amount: (0, get_smallest_unit_1.getSmallestUnit)(Number(amount), currency_code),
            country,
            language,
            currency: currency_code.toUpperCase(),
            description: normalizedParams.description || `Payment ${context?.idempotency_key}`,
            email: customerEmail,
            channel: normalizedParams.channel,
            method: normalizedParams.method,
            urlReturn,
            urlStatus: `${this.options_.backend_url}/hooks/payment/${this.getProviderKey()}_przelewy24`,
            ...(regulationAccept ? { regulationAccept: true } : {}),
        };
        if (cardRefId) {
            transactionRequest.cardData = {
                means: {
                    referenceNumber: { id: cardRefId },
                },
                transactionType: "standard",
            };
        }
        if (psu?.IP && psu?.userAgent) {
            transactionRequest.additional = {
                PSU: {
                    IP: psu.IP,
                    userAgent: psu.userAgent,
                },
            };
        }
        return transactionRequest;
    }
    resolvePaymentSessionQuery() {
        const resolve = this.container_.resolve;
        if (typeof resolve !== "function") {
            return undefined;
        }
        try {
            const query = resolve.call(this.container_, utils_1.ContainerRegistrationKeys.QUERY);
            if (query && typeof query.graph === "function") {
                return query;
            }
        }
        catch {
            // Payment provider scope does not register QUERY (e.g. webhook handling).
        }
        return undefined;
    }
    async findMedusaPaymentSessionId(p24SessionId) {
        const inferred = (0, p24_session_data_1.inferMedusaPaymentSessionIdFromP24SessionId)(p24SessionId);
        if (inferred) {
            return inferred;
        }
        const query = this.resolvePaymentSessionQuery();
        if (!query) {
            return p24SessionId;
        }
        const byId = await query.graph({
            entity: "payment_session",
            fields: ["id", "data"],
            filters: { id: p24SessionId },
        });
        if (byId.data?.[0]?.id) {
            return byId.data[0].id;
        }
        const providerPrefix = `pp_${this.getProviderKey()}`;
        const sessions = await query.graph({
            entity: "payment_session",
            fields: ["id", "data"],
            filters: {
                provider_id: { $like: `${providerPrefix}%` },
            },
        });
        const matched = sessions.data?.find((session) => {
            const sessionData = session.data ?? {};
            return (sessionData.session_id === p24SessionId ||
                sessionData.sessionId === p24SessionId);
        });
        return matched?.id ?? p24SessionId;
    }
    /**
     * Whether the Medusa payment for the given session has already been
     * captured. Mirrors the reconcile job's `hasCapturedPayment` guard so the
     * webhook handler is idempotent across P24 retries.
     *
     * Returns `false` when the query API is unavailable (e.g. webhook provider
     * scope) so the guard never blocks a legitimate first capture.
     */
    async hasCapturedPayment(medusaPaymentSessionId) {
        const query = this.resolvePaymentSessionQuery();
        if (!query) {
            return false;
        }
        try {
            const { data } = await query.graph({
                entity: "payment_session",
                fields: [
                    "id",
                    "payment_collection.payments.id",
                    "payment_collection.payments.captured_at",
                ],
                filters: { id: medusaPaymentSessionId },
            });
            const payments = data?.[0]?.payment_collection?.payments ?? [];
            return payments.some((payment) => Boolean(payment?.captured_at));
        }
        catch {
            return false;
        }
    }
    async enrichPaymentMethodFields(data) {
        const methodId = (0, p24_payment_methods_1.extractMethodIdFromSessionData)(data);
        if (!methodId) {
            return data;
        }
        if (data.paymentMethod === methodId &&
            typeof data.paymentMethodName === "string" &&
            data.paymentMethodName.length > 0 &&
            typeof data.paymentMethodGroup === "string" &&
            data.paymentMethodGroup.length > 0) {
            return data;
        }
        const currency = String(data.currency_code ?? data.currency ?? "PLN");
        const lang = String(data.language ?? "pl").toLowerCase();
        const amountGrosze = typeof data.amount_grosze === "number" && Number.isFinite(data.amount_grosze)
            ? Math.trunc(data.amount_grosze)
            : typeof data.amount === "number" && Number.isFinite(data.amount)
                ? (0, get_smallest_unit_1.getSmallestUnit)(data.amount, currency)
                : 0;
        const metadata = await (0, p24_payment_methods_1.resolveP24PaymentMethodMetadata)(this.p24Api, {
            methodId,
            lang,
            amountGrosze,
            currency,
            providerKey: this.getProviderKey(),
        });
        return {
            ...data,
            ...metadata,
            method_id: methodId,
            methodId,
        };
    }
    async initiatePayment(input) {
        const { currency_code, amount, context, data } = input;
        try {
            const sessionId = context?.idempotency_key;
            const p24SessionId = data?.p24_session_id || sessionId;
            if (!sessionId) {
                throw this.buildError("Missing idempotency key for P24 transaction", new Error("idempotency_key is required"));
            }
            this.logger_.debug(`Initiating P24 payment amount=${amount} ${currency_code} session=${sessionId} context=${JSON.stringify((0, p24_logger_1.redactUnknown)(context))}`);
            const transactionRequest = this.buildTransactionRequest(input, p24SessionId);
            const sessionData = await this.p24Api.registerTransaction(transactionRequest);
            if (sessionData.responseCode !== 0) {
                throw this.buildError((0, p24_errors_1.buildLocalizedP24ErrorMessage)(sessionData, "Failed to register P24 transaction"), new Error(`P24 API error: ${sessionData.responseCode} - ${sessionData.message || "Unknown error"}`));
            }
            const isWhiteLabel = Boolean(this.paymentIntentOptions.white_label);
            const redirectUrl = `${this.p24Api.getBaseRedirectURL()}/${sessionData.data.token}`;
            const normalizedData = await this.enrichPaymentMethodFields((0, p24_session_data_1.normalizeP24SessionData)({
                session_id: transactionRequest.sessionId,
                medusa_payment_session_id: sessionId,
                token: sessionData.data.token,
                amount: Number(amount),
                amount_grosze: transactionRequest.amount,
                currency: currency_code,
                currency_code,
                description: transactionRequest.description,
                email: transactionRequest.email,
                country: transactionRequest.country,
                language: transactionRequest.language,
                channel: transactionRequest.channel,
                method_id: transactionRequest.method,
                ...(transactionRequest.method != null
                    ? { paymentMethod: transactionRequest.method }
                    : {}),
                white_label: isWhiteLabel,
                ...(isWhiteLabel ? {} : { redirect_url: redirectUrl }),
                responseCode: sessionData.responseCode,
            }));
            this.logger_.info(`P24 payment initiated for session ${sessionId}`);
            return {
                id: transactionRequest.sessionId,
                data: normalizedData,
            };
        }
        catch (error) {
            this.logger_.error(`Error initiating P24 payment: ${error.message}`);
            throw error;
        }
    }
    async authorizePayment(input) {
        const sessionId = (0, p24_session_data_1.getSessionId)(input.data);
        if (!sessionId) {
            throw this.buildError("Session ID is required for payment authorization", new Error("No session ID provided"));
        }
        try {
            const { transactionDetails, p24Status, medusaStatus } = await this.getTransactionDetailsAndStatus(sessionId);
            if (!["authorized", "captured"].includes(medusaStatus)) {
                throw this.buildError(`Payment is not in a valid state for authorization: current status is ${medusaStatus}`, new Error(`Invalid payment status: ${medusaStatus}`));
            }
            let data = await this.enrichPaymentMethodFields((0, p24_session_data_1.normalizeP24SessionData)({
                ...input.data,
                ...transactionDetails.data,
                amount_grosze: transactionDetails.data.amount,
                p24_status: p24Status,
                order_id: transactionDetails.data.orderId,
            }));
            const currencyCode = data.currency || input.data?.currency_code;
            if (!currencyCode) {
                throw this.buildError(`Missing currency code for amount conversion in authorizePayment (session: ${sessionId})`, new Error("currency_code is required to convert P24 amount"));
            }
            if (data.amount != null) {
                data.amount = (0, get_smallest_unit_1.getAmountFromSmallestUnit)(data.amount, currencyCode);
            }
            if (data.originAmount != null) {
                data.originAmount = (0, get_smallest_unit_1.getAmountFromSmallestUnit)(data.originAmount, currencyCode);
            }
            return {
                data,
                status: medusaStatus,
            };
        }
        catch (error) {
            this.logger_.error(`Error authorizing payment ${sessionId}: ${error.message}`);
            throw error;
        }
    }
    async capturePayment(input) {
        const sessionId = (0, p24_session_data_1.getSessionId)(input.data);
        const amount = input.data?.amount;
        const currency = input.data?.currency || input.data?.currency_code;
        const orderId = (0, p24_session_data_1.getOrderId)(input.data);
        if (!sessionId || amount == null || !currency || orderId == null) {
            throw this.buildError("Missing required data for payment capture", new Error("Session ID, amount, currency, and order ID are required"));
        }
        try {
            const verification = await this.p24Api.verifyTransaction(sessionId, (0, get_smallest_unit_1.getSmallestUnit)(amount, currency), currency, orderId);
            if (verification.responseCode !== 0 ||
                verification.data.status !== "success") {
                throw this.buildError("Payment capture failed", new Error(`Verification failed - responseCode: ${verification.responseCode}, status: ${verification.data.status}`));
            }
            return {
                data: await this.enrichPaymentMethodFields((0, p24_session_data_1.normalizeP24SessionData)({
                    ...input.data,
                    status: "captured",
                    captured_at: new Date().toISOString(),
                    order_id: orderId,
                    capture_verified: true,
                })),
            };
        }
        catch (error) {
            const message = (0, payment_job_errors_1.getJobErrorMessage)(error);
            if ((0, payment_job_errors_1.isExpectedStalePaymentJobFailure)(error)) {
                this.logger_.debug(`Skipping stale payment capture for ${sessionId}: ${message}`);
            }
            else {
                this.logger_.error(`Error capturing payment ${sessionId}: ${message}`);
            }
            throw error;
        }
    }
    async deletePayment(input) {
        return {
            data: input.data,
        };
    }
    async cancelPayment(input) {
        return {
            data: input.data,
        };
    }
    async refundPayment(input) {
        const { data: paymentData, amount: refundAmount, context } = input;
        const sessionId = (0, p24_session_data_1.getSessionId)(paymentData);
        const orderId = (0, p24_session_data_1.getOrderId)(paymentData);
        if (!sessionId || orderId == null) {
            throw this.buildError("No session ID or order ID provided while refunding payment", new Error("Missing session ID or order ID"));
        }
        try {
            const refundsUuid = crypto_1.default.randomUUID();
            const requestId = context?.idempotency_key;
            if (typeof requestId !== "string" || requestId.length === 0) {
                throw this.buildError("Missing idempotency key for refund request", new Error("context.idempotency_key is required"));
            }
            const currencyCode = paymentData?.currency_code ||
                paymentData?.currency ||
                "pln";
            const refundData = {
                requestId,
                refunds: [
                    {
                        orderId,
                        sessionId,
                        amount: (0, get_smallest_unit_1.getSmallestUnit)(Number(refundAmount), currencyCode),
                        description: `Refund for order ${sessionId}`,
                    },
                ],
                refundsUuid,
            };
            const refundResult = await this.p24Api.processRefund(refundData);
            const refundStatus = refundResult.data[0]?.status;
            const refundMessage = refundResult.data[0]?.message;
            if (refundResult.responseCode !== 0 || !refundStatus) {
                throw this.buildError("Refund request failed", new Error(`P24 API error: ${refundResult.responseCode} - ${refundMessage || "Unknown error"}`));
            }
            const p24RefundsNormal = Array.isArray(refundResult.data)
                ? refundResult.data.map((item) => {
                    const out = { ...item };
                    const curr = item.currency || currencyCode;
                    if (out.amount != null) {
                        out.amount = (0, get_smallest_unit_1.getAmountFromSmallestUnit)(out.amount, curr);
                    }
                    if (out.originAmount != null) {
                        out.originAmount = (0, get_smallest_unit_1.getAmountFromSmallestUnit)(out.originAmount, curr);
                    }
                    return out;
                })
                : refundResult.data;
            return {
                data: (0, p24_session_data_1.normalizeP24SessionData)({
                    ...paymentData,
                    refund_amount: refundAmount,
                    refunded_at: new Date().toISOString(),
                    refunds_uuid: refundsUuid,
                    refund_request_id: requestId,
                    refund_status: refundStatus,
                    refund_message: refundMessage,
                    p24_refunds: p24RefundsNormal,
                    p24_response_code: refundResult.responseCode,
                    status: "refund_requested",
                }),
            };
        }
        catch (e) {
            throw this.buildError("An error occurred in refundPayment", e);
        }
    }
    async retrievePayment(input) {
        try {
            return {
                data: (0, p24_session_data_1.normalizeP24SessionData)(input.data),
            };
        }
        catch (e) {
            throw this.buildError("An error occurred in retrievePayment", e);
        }
    }
    async updatePayment(input) {
        const { data, amount, currency_code, context } = input;
        const amountNumeric = Number(amount);
        const currentAmount = Number(data?.amount);
        if (Number.isFinite(currentAmount) && currentAmount === amountNumeric) {
            return { data: (0, p24_session_data_1.normalizeP24SessionData)(data) };
        }
        const baseSessionId = context?.idempotency_key || (0, p24_session_data_1.getSessionId)(data);
        if (!baseSessionId) {
            throw this.buildError("Cannot update P24 payment without session id", new Error("Missing session id"));
        }
        const newP24SessionId = `${baseSessionId}-${crypto_1.default.randomUUID()}`;
        const initiated = await this.initiatePayment({
            amount,
            currency_code,
            context: {
                ...context,
                idempotency_key: baseSessionId,
            },
            data: {
                ...data,
                amount: amountNumeric,
                medusa_payment_session_id: baseSessionId,
                p24_session_id: newP24SessionId,
            },
        });
        return {
            data: (0, p24_session_data_1.normalizeP24SessionData)({
                ...data,
                ...initiated.data,
                session_id: initiated.data?.session_id,
                medusa_payment_session_id: baseSessionId,
                amount: amountNumeric,
            }),
        };
    }
    async getWebhookActionAndData(webhookData) {
        return (0, p24_webhook_1.processP24Webhook)({
            p24Api: this.p24Api,
            logger: this.logger_,
            findMedusaPaymentSessionId: (p24SessionId) => this.findMedusaPaymentSessionId(p24SessionId),
            hasCapturedPayment: (medusaPaymentSessionId) => this.hasCapturedPayment(medusaPaymentSessionId),
            buildError: (message, error) => this.buildError(message, error),
        }, webhookData);
    }
    async getPaymentStatus(input) {
        const sessionId = input.context?.idempotency_key;
        if (!sessionId) {
            this.logger_.warn("No session ID provided for getPaymentStatus, returning pending");
            return { status: "pending" };
        }
        try {
            const { medusaStatus } = await this.getTransactionDetailsAndStatus(sessionId);
            return { status: medusaStatus };
        }
        catch (error) {
            this.logger_.error(`Error getting payment status for session ${sessionId}: ${error.message}`);
            throw error;
        }
    }
    async queryTransactionStatus(sessionId) {
        return this.getTransactionDetailsAndStatus(sessionId);
    }
    /**
     * Public server-side verification via P24's `/transaction/verify`
     * (cryptographic sign). Exposed so the reconcile job can verify a
     * captured/authorized transaction before capturing it in Medusa, rather
     * than trusting the cart amount.
     */
    async verifyTransaction(sessionId, amount, currency, orderId) {
        return this.p24Api.verifyTransaction(sessionId, amount, currency, orderId);
    }
    async getTransactionDetailsAndStatus(sessionId) {
        return (0, p24_transaction_status_1.fetchTransactionDetailsAndStatus)({
            p24Api: this.p24Api,
            logger: this.logger_,
            buildError: (message, error) => this.buildError(message, error),
        }, sessionId);
    }
    mapP24StatusToMedusaStatus(p24Status) {
        return (0, p24_transaction_status_1.mapP24StatusToMedusaStatus)(p24Status);
    }
    buildError(message, error) {
        const suffix = error instanceof Error
            ? error.message
            : typeof error === "string"
                ? error
                : "Unknown error";
        return new Error(`${message}: ${suffix}`.trim());
    }
}
exports.default = P24Base;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3ByemVsZXd5MjQvY29yZS9wMjQtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG9EQUE0QjtBQU81QixxREFJbUM7QUFTbkMsaURBQW9EO0FBQ3BELHFFQUdrQztBQUNsQywrQ0FBa0Q7QUFDbEQsd0VBRzBDO0FBQzFDLGtFQUE4RDtBQUM5RCxzRUFLeUM7QUFDekMsNEVBRzRDO0FBQzVDLDBEQUEyRTtBQUMzRSwwREFBMEU7QUFDMUUsMEVBRzJDO0FBMEMzQyxNQUFlLE9BQVEsU0FBUSwrQkFBbUM7SUFDN0MsUUFBUSxDQUFhO0lBQ3JCLE1BQU0sQ0FBZ0I7SUFDdEIsVUFBVSxDQUFlO0lBQ3pCLE9BQU8sQ0FBcUM7SUFFL0QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFtQjtRQUN4QyxJQUFJLENBQUMsSUFBQSxpQkFBUyxFQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1lBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0RBQXdELENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUEsaUJBQVMsRUFBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFBLGlCQUFTLEVBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBQSxpQkFBUyxFQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBQ0Qs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