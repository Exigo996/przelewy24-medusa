import { MedusaRequest } from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  Modules,
  PaymentSessionStatus,
} from "@medusajs/framework/utils";
import { buildLocalizedP24ErrorMessage } from "../../../../utils/p24-errors";

type ChargeExecutorResult = {
  orderId?: number;
  redirectUrl?: string;
  message?: string;
};

type ChargeExecutor = () => Promise<ChargeExecutorResult>;

type HandleChargeInput = {
  req: MedusaRequest;
  paymentSessionId?: string;
  execute: ChargeExecutor;
};

type P24ChargeResponse = {
  responseCode?: number;
  data?: Record<string, unknown>;
  message?: string;
};

export async function markPaymentSessionError(
  req: MedusaRequest,
  paymentSessionId: string,
  errorMessage: string,
): Promise<void> {
  const paymentModule = req.scope.resolve(Modules.PAYMENT);
  const session = await paymentModule.retrievePaymentSession(paymentSessionId);

  await paymentModule.updatePaymentSession({
    id: paymentSessionId,
    amount: session.amount,
    currency_code: session.currency_code,
    status: PaymentSessionStatus.ERROR,
    data: {
      ...(session.data ?? {}),
      error_message: errorMessage,
      failed_at: new Date().toISOString(),
    },
  });
}

export function parseP24ChargeResponse(
  response: P24ChargeResponse,
): ChargeExecutorResult {
  if (response.responseCode !== 0) {
    throw new Error(
      buildLocalizedP24ErrorMessage(
        response,
        (typeof response.data?.message === "string"
          ? response.data.message
          : response.message) || "Payment charge failed",
      ),
    );
  }

  return {
    orderId:
      typeof response.data?.orderId === "number"
        ? response.data.orderId
        : undefined,
    redirectUrl:
      typeof response.data?.redirectUrl === "string"
        ? response.data.redirectUrl
        : undefined,
    message:
      typeof response.data?.message === "string"
        ? response.data.message
        : undefined,
  };
}

export async function handleP24Charge({
  req,
  paymentSessionId,
  execute,
}: HandleChargeInput) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

  try {
    const result = await execute();

    return {
      success: true,
      orderId: result.orderId,
      redirectUrl: result.redirectUrl,
      message: result.message,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown payment charge error";

    logger.error(`[p24-charge] ${message}`);

    if (paymentSessionId) {
      await markPaymentSessionError(req, paymentSessionId, message).catch(
        (markError) => {
          logger.error(
            `[p24-charge] Failed to mark payment session ${paymentSessionId} as error: ${
              markError instanceof Error ? markError.message : "unknown"
            }`,
          );
        },
      );
    }

    throw error;
  }
}

type PaymentProviderServiceLike = {
  retrieveProvider: <TProvider>(providerId: string) => TProvider;
};

/**
 * Medusa's public `IPaymentModuleService` does not expose `retrieveProvider()`.
 * That method lives on the internal `PaymentProviderService`, which is only wired
 * through the payment module's Awilix cradle (`paymentProviderService_`).
 *
 * Plugin API routes (BLIK/card charge, reconcile job) need the concrete provider
 * instance to call P24-specific methods (`chargeBlikPayment`, `queryTransactionStatus`).
 * The supported module entry point is `container.resolve(Modules.PAYMENT)`, but the
 * framework does not surface provider retrieval on that facade — hence `__container__`.
 *
 * If Medusa adds a public API for this, switch to it and drop the internal access.
 */
type PaymentModuleWithProviderContainer = {
  __container__: {
    paymentProviderService: PaymentProviderServiceLike;
  };
};

type ContainerLike = {
  resolve: (key: string) => unknown;
};

export function resolvePaymentProviderById<T>(
  container: ContainerLike,
  providerId: string,
): T {
  const paymentModule = container.resolve(
    Modules.PAYMENT,
  ) as unknown as PaymentModuleWithProviderContainer;

  return paymentModule.__container__.paymentProviderService.retrieveProvider<T>(
    providerId,
  );
}

export async function assertBlikChargeMatchesPaymentSession(
  req: MedusaRequest,
  paymentSessionId: string,
  token: string,
  expectedProviderId: string,
): Promise<void> {
  const paymentModule = req.scope.resolve(Modules.PAYMENT);
  const session = await paymentModule.retrievePaymentSession(paymentSessionId);

  if (session.provider_id !== expectedProviderId) {
    throw new Error("Payment session provider mismatch");
  }

  const sessionToken =
    typeof session.data?.token === "string" ? session.data.token : undefined;

  if (!sessionToken || sessionToken !== token) {
    throw new Error("Payment session token mismatch");
  }
}

export function resolveP24Provider<T>(
  req: MedusaRequest,
  providerKey: string,
): T {
  const providerId = `pp_${providerKey}_przelewy24`;

  return resolvePaymentProviderById<T>(req.scope, providerId);
}
