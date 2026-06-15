import { PaymentSessionStatus } from "@medusajs/types";

import { P24ApiService } from "../services/p24-api";
import { P24TransactionBySessionIdResponse } from "../types";
import { createP24Logger } from "../../../utils/p24-logger";

export function mapP24StatusToMedusaStatus(
  p24Status: number,
): PaymentSessionStatus {
  switch (p24Status) {
    case 0:
      return "pending";
    case 1:
      return "authorized";
    case 2:
      return "captured";
    case 3:
      return "canceled";
    default:
      return "error";
  }
}

type TransactionStatusDeps = {
  p24Api: P24ApiService;
  logger: ReturnType<typeof createP24Logger>;
  buildError: (message: string, error?: unknown) => Error;
};

export async function fetchTransactionDetailsAndStatus(
  deps: TransactionStatusDeps,
  sessionId: string,
): Promise<{
  transactionDetails: P24TransactionBySessionIdResponse;
  p24Status: number;
  medusaStatus: PaymentSessionStatus;
}> {
  const transactionDetails =
    await deps.p24Api.getTransactionBySessionId(sessionId);

  if (transactionDetails.responseCode !== 0) {
    throw deps.buildError(
      "Failed to retrieve transaction details",
      new Error(`P24 API error: ${transactionDetails.responseCode}`),
    );
  }

  const p24Status = parseInt(transactionDetails.data.status, 10);
  const medusaStatus = mapP24StatusToMedusaStatus(p24Status);

  deps.logger.debug(
    `P24 status ${p24Status} mapped to Medusa status ${medusaStatus} for session ${sessionId}`,
  );

  return {
    transactionDetails,
    p24Status,
    medusaStatus,
  };
}
