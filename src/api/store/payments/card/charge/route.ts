import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { z } from "zod";

import P24CardsService from "../../../../../providers/przelewy24/services/p24-cards";
import {
  assertPaymentSessionProvider,
  resolveP24Provider,
  resolvePaymentSessionIdempotencyKey,
} from "../../utils/charge-helper";
import { PaymentProviderKeys } from "../../../../../providers/przelewy24/types";
import { normalizeP24SessionData } from "../../../../../utils/p24-session-data";

const CARDS_PROVIDER_ID = `pp_${PaymentProviderKeys.P24_CARDS}_przelewy24`;

const cardRegisterSchema = z.object({
  ref_id: z.string().min(1, "Card reference id is required").max(200),
  payment_session_id: z.string().min(1, "Payment session id is required"),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validationResult = cardRegisterSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map(
      (err) => `${err.path.join(".")}: ${err.message}`,
    );

    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  const { ref_id, payment_session_id } = validationResult.data;

  try {
    const paymentModule = req.scope.resolve(Modules.PAYMENT);
    const paymentSession =
      await paymentModule.retrievePaymentSession(payment_session_id);

    assertPaymentSessionProvider(paymentSession, CARDS_PROVIDER_ID);

    const provider = resolveP24Provider<P24CardsService>(
      req,
      PaymentProviderKeys.P24_CARDS,
    );

    const result = await provider.registerWithRefId({
      refId: ref_id,
      input: {
        amount: paymentSession.amount,
        currency_code: paymentSession.currency_code,
        context: {
          idempotency_key: resolvePaymentSessionIdempotencyKey(paymentSession),
        },
        data: {
          ...(paymentSession.data ?? {}),
          regulation_accept: true,
        },
      },
    });

    await paymentModule.updatePaymentSession({
      id: payment_session_id,
      amount: paymentSession.amount,
      currency_code: paymentSession.currency_code,
      data: normalizeP24SessionData({
        ...(paymentSession.data ?? {}),
        ...(result.sessionData ?? {}),
        pending_card_tokenization: false,
        token: result.token,
      }),
    });

    return res.status(200).json({
      success: true,
      token: result.token,
      chargeScriptUrl: result.chargeScriptUrl,
      sessionId: result.sessionId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Card payment failed";

    return res.status(400).json({
      error: "Card payment failed",
      message,
    });
  }
}
