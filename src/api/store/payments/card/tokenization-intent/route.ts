import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

import P24CardsService from "../../../../../providers/przelewy24/services/p24-cards";
import { resolveP24Provider } from "../../utils/charge-helper";
import { PaymentProviderKeys } from "../../../../../providers/przelewy24/types";

const tokenizationIntentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  currency_code: z
    .string()
    .min(1, "Currency code is required")
    .max(10, "Currency code is too long"),
});

/**
 * Returns the data required to render the P24 card tokenization iframe without
 * creating a payment session, payment collection, or P24 transaction.
 *
 * This lets the storefront mount the card widget the moment the customer
 * selects "Cards" (e.g. during order-change settlement) while deferring any
 * real commitment until the customer actually pays.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validationResult = tokenizationIntentSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`,
    );

    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  const { amount, currency_code } = validationResult.data;

  try {
    const provider = resolveP24Provider<P24CardsService>(
      req,
      PaymentProviderKeys.P24_CARDS,
    );

    const intent = provider.createCardTokenizationIntent({
      amount,
      currency_code,
    });

    return res.status(200).json(intent);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create card tokenization intent";

    return res.status(400).json({
      error: "Card tokenization intent failed",
      message,
    });
  }
}
