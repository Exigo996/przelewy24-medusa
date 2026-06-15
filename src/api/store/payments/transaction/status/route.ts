import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

import P24BlikService from '../../../../../providers/przelewy24/services/p24-blik'
import { resolveP24Provider } from '../../utils/charge-helper'
import { PaymentProviderKeys } from '../../../../../providers/przelewy24/types'

const statusSchema = z.object({
  session_id: z.string().min(1),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validationResult = statusSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationResult.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`,
      ),
    });
  }

  const { session_id } = validationResult.data;

  try {
    const provider = resolveP24Provider<P24BlikService>(
      req,
      PaymentProviderKeys.P24_BLIK,
    );

    const { medusaStatus, p24Status } = await provider.queryTransactionStatus(
      session_id,
    );

    return res.status(200).json({
      session_id,
      p24_status: p24Status,
      status: medusaStatus,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to query transaction status";

    return res.status(400).json({
      error: "Failed to query transaction status",
      message,
    });
  }
}
