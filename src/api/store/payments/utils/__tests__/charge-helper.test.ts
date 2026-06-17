import { describe, expect, it, vi } from "vitest";

import {
  assertBlikChargeMatchesPaymentSession,
  resolveP24Provider,
  resolveP24ProviderKeyForStatus,
  resolvePaymentProviderById,
  resolvePaymentSessionIdempotencyKey,
} from "../charge-helper";
import { PaymentProviderKeys } from "../../../../../providers/przelewy24/types";

describe("resolveP24ProviderKeyForStatus", () => {
  it("parses full provider id", () => {
    expect(
      resolveP24ProviderKeyForStatus({
        provider_id: "pp_p24-cards_przelewy24",
      }),
    ).toBe(PaymentProviderKeys.P24_CARDS);
  });

  it("accepts provider key directly", () => {
    expect(
      resolveP24ProviderKeyForStatus({
        provider_key: PaymentProviderKeys.P24_VISA_MOBILE,
      }),
    ).toBe(PaymentProviderKeys.P24_VISA_MOBILE);
  });

  it("rejects conflicting provider key and provider id", () => {
    expect(() =>
      resolveP24ProviderKeyForStatus({
        provider_key: PaymentProviderKeys.P24_BLIK,
        provider_id: "pp_p24-cards_przelewy24",
      }),
    ).toThrow("Payment provider mismatch");
  });

  it("defaults to BLIK when provider is omitted", () => {
    expect(resolveP24ProviderKeyForStatus({})).toBe(
      PaymentProviderKeys.P24_BLIK,
    );
  });
});

describe("resolvePaymentSessionIdempotencyKey", () => {
  it("prefers medusa_payment_session_id when it is a non-empty string", () => {
    expect(
      resolvePaymentSessionIdempotencyKey({
        id: "payses_1",
        data: { medusa_payment_session_id: "payses_medusa" },
      }),
    ).toBe("payses_medusa");
  });

  it("falls back to payment session id for invalid values", () => {
    expect(
      resolvePaymentSessionIdempotencyKey({
        id: "payses_1",
        data: { medusa_payment_session_id: 123 },
      }),
    ).toBe("payses_1");
  });
});

describe("assertBlikChargeMatchesPaymentSession", () => {
  it("accepts matching provider and token", async () => {
    const retrievePaymentSession = vi.fn().mockResolvedValue({
      id: "payses_1",
      provider_id: "pp_p24-blik_przelewy24",
      data: { token: "tok_abc" },
    });

    const req = {
      scope: {
        resolve: vi.fn().mockReturnValue({
          retrievePaymentSession,
        }),
      },
    };

    await expect(
      assertBlikChargeMatchesPaymentSession(
        req as never,
        "payses_1",
        "tok_abc",
        "pp_p24-blik_przelewy24",
      ),
    ).resolves.toBeUndefined();
  });

  it("rejects token mismatch", async () => {
    const req = {
      scope: {
        resolve: vi.fn().mockReturnValue({
          retrievePaymentSession: vi.fn().mockResolvedValue({
            id: "payses_1",
            provider_id: "pp_p24-blik_przelewy24",
            data: { token: "tok_expected" },
          }),
        }),
      },
    };

    await expect(
      assertBlikChargeMatchesPaymentSession(
        req as never,
        "payses_1",
        "tok_other",
        "pp_p24-blik_przelewy24",
      ),
    ).rejects.toThrow("token mismatch");
  });

  it("rejects provider mismatch", async () => {
    const req = {
      scope: {
        resolve: vi.fn().mockReturnValue({
          retrievePaymentSession: vi.fn().mockResolvedValue({
            id: "payses_1",
            provider_id: "pp_p24-blik_przelewy24",
            data: { token: "tok_abc" },
          }),
        }),
      },
    };

    await expect(
      assertBlikChargeMatchesPaymentSession(
        req as never,
        "payses_1",
        "tok_abc",
        "pp_p24-cards_przelewy24",
      ),
    ).rejects.toThrow("provider mismatch");
  });
});

describe("resolveP24Provider", () => {
  it("retrieves provider from payment module container", () => {
    const visaProvider = { queryTransactionStatus: vi.fn() };
    const retrieveProvider = vi.fn().mockReturnValue(visaProvider);

    const req = {
      scope: {
        resolve: vi.fn().mockReturnValue({
          __container__: {
            paymentProviderService: {
              retrieveProvider,
            },
          },
        }),
      },
    };

    const provider = resolveP24Provider(
      req as never,
      PaymentProviderKeys.P24_VISA_MOBILE,
    );

    expect(retrieveProvider).toHaveBeenCalledWith(
      "pp_p24-visa-mobile_przelewy24",
    );
    expect(provider).toBe(visaProvider);
  });
});

describe("resolvePaymentProviderById", () => {
  it("retrieves provider by full provider id from payment module container", () => {
    const blikProvider = { queryTransactionStatus: vi.fn() };
    const retrieveProvider = vi.fn().mockReturnValue(blikProvider);

    const container = {
      resolve: vi.fn().mockReturnValue({
        __container__: {
          paymentProviderService: {
            retrieveProvider,
          },
        },
      }),
    };

    const provider = resolvePaymentProviderById(
      container as never,
      "pp_p24-blik_przelewy24",
    );

    expect(retrieveProvider).toHaveBeenCalledWith("pp_p24-blik_przelewy24");
    expect(provider).toBe(blikProvider);
  });
});
