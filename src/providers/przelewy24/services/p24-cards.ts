import { randomUUID } from "crypto";

import {
  InitiatePaymentInput,
  InitiatePaymentOutput,
} from "@medusajs/framework/types";

import { getSmallestUnit } from "../../../utils/get-smallest-unit";
import { normalizeP24SessionData } from "../../../utils/p24-session-data";
import P24Base from "../core/p24-base";
import {
  CardsOptions,
  DEFAULT_CARD_CHANNEL,
  P24PaymentIntentOptions,
  PaymentProviderKeys,
} from "../types";
import { coerceSandbox } from "../../../utils/coerce-sandbox";

class P24CardsService extends P24Base {
  static identifier = PaymentProviderKeys.P24_CARDS;

  private readonly cardsOptions_: CardsOptions;

  constructor(cradle: Record<string, unknown>, options: CardsOptions) {
    const normalizedOptions: CardsOptions = {
      ...options,
      sandbox: coerceSandbox(options.sandbox),
      card_channel: options.card_channel ?? DEFAULT_CARD_CHANNEL,
      white_label: options.white_label ?? true,
    };

    super(cradle, normalizedOptions);
    this.cardsOptions_ = normalizedOptions;
  }

  get paymentIntentOptions(): P24PaymentIntentOptions {
    return {
      channel: this.cardsOptions_.card_channel ?? DEFAULT_CARD_CHANNEL,
      description: "Payment via Przelewy24 - Credit/Debit Cards",
      white_label: this.cardsOptions_.white_label ?? true,
    };
  }

  protected getProviderKey(): string {
    return PaymentProviderKeys.P24_CARDS;
  }

  async initiatePayment(
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentOutput> {
    const sessionId = input.context?.idempotency_key as string | undefined;
    const p24SessionId =
      (input.data?.p24_session_id as string | undefined) || sessionId;
    const cardRefId =
      typeof input.data?.card_ref_id === "string"
        ? input.data.card_ref_id
        : undefined;

    if (!cardRefId) {
      if (!sessionId || !p24SessionId) {
        throw this.buildError(
          "Missing idempotency key for P24 card session",
          new Error("idempotency_key is required"),
        );
      }

      const transactionRequest = this.buildTransactionRequest(
        input,
        p24SessionId,
      );
      const tokenizationSign =
        this.p24Api.generateCardTokenizationSign(p24SessionId);
      const amountGrosze = getSmallestUnit(
        Number(input.amount),
        input.currency_code,
      );
      const psu =
        input.data?.psu &&
        typeof input.data.psu === "object" &&
        typeof (input.data.psu as { IP?: unknown }).IP === "string" &&
        typeof (input.data.psu as { userAgent?: unknown }).userAgent ===
          "string"
          ? (input.data.psu as { IP: string; userAgent: string })
          : undefined;

      return {
        id: p24SessionId,
        data: normalizeP24SessionData({
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
        regulation_accept:
          input.data?.regulation_accept === true ||
          input.data?.regulationAccept === true,
      },
    });
  }

  async registerWithRefId({
    refId,
    input,
  }: {
    refId: string;
    input: InitiatePaymentInput;
  }) {
    const initiated = await this.initiatePayment({
      ...input,
      data: {
        ...input.data,
        card_ref_id: refId,
        regulation_accept: true,
      },
    });

    const token =
      typeof initiated.data?.token === "string" ? initiated.data.token : "";

    if (!token) {
      throw this.buildError(
        "Missing P24 transaction token after card registration",
        new Error("token is required"),
      );
    }

    return {
      token,
      chargeScriptUrl: this.p24Api.getCardWhitelabelScriptUrl(token),
      sessionId:
        typeof initiated.data?.session_id === "string"
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
  createCardTokenizationIntent({
    amount,
    currency_code,
  }: {
    amount: number;
    currency_code: string;
  }) {
    const sessionId = randomUUID();

    return {
      merchant_id: parseInt(this.options_.merchant_id),
      session_id: sessionId,
      card_tokenization_sign:
        this.p24Api.generateCardTokenizationSign(sessionId),
      amount_grosze: getSmallestUnit(Number(amount), currency_code),
      currency_code,
    };
  }

  getCardTokenizationScriptUrl(): string {
    return this.p24Api.getCardTokenizationScriptUrl();
  }
}

export default P24CardsService;
