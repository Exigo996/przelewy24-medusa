import { describe, expect, it, vi } from "vitest";

import {
  assertBlikChargeMatchesPaymentSession,
  resolveP24Provider,
  resolvePaymentProviderById,
} from "../charge-helper";
import { PaymentProviderKeys } from "../../../../../providers/przelewy24/types";

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
});

describe("resolveP24Provider", () => {
  it("retrieves provider from payment module container", () => {
    const visaProvider = { chargeVisaMobilePayment: vi.fn() };
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
