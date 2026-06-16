import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import { POST as chargeBlikPayment } from "../../store/payments/blik/charge/route.js";

/**
 * @deprecated Use POST /store/payments/blik/charge instead.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  logger.warn(
    "Deprecated route /payments/blik called. Use /store/payments/blik/charge instead.",
  );

  return chargeBlikPayment(req, res);
}
