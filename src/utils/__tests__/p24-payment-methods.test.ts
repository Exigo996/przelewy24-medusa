import { describe, expect, it, vi } from "vitest";

import {
  extractMethodIdFromSessionData,
  fetchP24PaymentMethods,
  parseP24MethodId,
  resolveP24PaymentMethodMetadata,
} from "../p24-payment-methods";
import { PaymentProviderKeys } from "../../providers/przelewy24/types";

describe("parseP24MethodId", () => {
  it("parses numeric and string ids", () => {
    expect(parseP24MethodId(94)).toBe(94);
    expect(parseP24MethodId("241")).toBe(241);
    expect(parseP24MethodId("")).toBeUndefined();
  });
});

describe("extractMethodIdFromSessionData", () => {
  it("reads method id from known session keys", () => {
    expect(
      extractMethodIdFromSessionData({
        methodId: 94,
        paymentMethod: 241,
      }),
    ).toBe(94);

    expect(
      extractMethodIdFromSessionData({
        paymentMethod: "241",
      }),
    ).toBe(241);
  });
});

describe("fetchP24PaymentMethods cache", () => {
  it("reuses fresh cache entries and refetches after TTL", async () => {
    vi.useFakeTimers();

    const p24Api = {
      getPaymentMethods: vi.fn().mockResolvedValue({
        responseCode: 0,
        data: [{ id: 94, name: "mbank", group: "FastTransfers" }],
      }),
    };

    const params = { lang: "pl", amountGrosze: 75000, currency: "PLN" };

    await fetchP24PaymentMethods(p24Api as never, params);
    await fetchP24PaymentMethods(p24Api as never, params);
    expect(p24Api.getPaymentMethods).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(15 * 60 * 1000 + 1);

    await fetchP24PaymentMethods(p24Api as never, params);
    expect(p24Api.getPaymentMethods).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

describe("resolveP24PaymentMethodMetadata", () => {
  it("maps method id to name and group from P24 methods API", async () => {
    const p24Api = {
      getPaymentMethods: vi.fn().mockResolvedValue({
        responseCode: 0,
        data: [
          { id: 94, name: "mbank", group: "FastTransfers", status: true },
        ],
      }),
    };

    const metadata = await resolveP24PaymentMethodMetadata(
      p24Api as never,
      {
        methodId: 94,
        lang: "pl",
        amountGrosze: 75000,
        currency: "PLN",
      },
    );

    expect(metadata).toEqual({
      paymentMethod: 94,
      paymentMethodName: "mbank",
      paymentMethodGroup: "FastTransfers",
    });
  });

  it("falls back to provider defaults when API lookup misses", async () => {
    const p24Api = {
      getPaymentMethods: vi.fn().mockResolvedValue({
        responseCode: 0,
        data: [],
      }),
    };

    const metadata = await resolveP24PaymentMethodMetadata(
      p24Api as never,
      {
        methodId: 241,
        lang: "pl",
        amountGrosze: 75000,
        currency: "PLN",
        providerKey: PaymentProviderKeys.P24_CARDS,
      },
    );

    expect(metadata.paymentMethod).toBe(241);
    expect(metadata.paymentMethodGroup).toBe("Credit Card");
    expect(metadata.paymentMethodName).toBe("card");
  });
});
