import { describe, it, expect, vi, beforeEach } from "vitest";
import P24Base from "../p24-base";

vi.mock("../../services/p24-api", () => ({
  P24ApiService: class {
    registerTransaction = vi.fn();
    processRefund = vi.fn();
    getBaseRedirectURL = vi.fn().mockReturnValue("https://sandbox.przelewy24.pl/trnRequest");
    generateSign = vi.fn().mockReturnValue("test-widget-sign");
  },
}));

vi.mock("@medusajs/framework/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@medusajs/framework/utils")>();

  return {
    ...actual,
    AbstractPaymentProvider: class {
      constructor() {}
      static validateOptions() {}
    },
    isDefined: (val: unknown) => val !== undefined && val !== null,
  };
});

const TEST_OPTIONS = {
  merchant_id: "12345",
  pos_id: "12345",
  api_key: "test_api_key",
  crc: "test_crc",
  sandbox: true,
  frontend_url: "http://localhost:3000",
  backend_url: "http://localhost:9000",
};

class TestP24Provider extends P24Base {
  static identifier = "test-p24";

  get paymentIntentOptions() {
    return { channel: 16, description: "Test payment" };
  }

  protected getProviderKey(): string {
    return "test-p24";
  }

  constructor(cradle: Record<string, unknown> = {}) {
    super(cradle, TEST_OPTIONS);
  }
}

class TestP24ProviderWithThrowingQuery extends TestP24Provider {
  constructor() {
    super({
      resolve: () => {
        throw new Error("Could not resolve 'query'");
      },
    });
  }
}

describe("P24Base – amount conversion", () => {
  let provider: TestP24Provider;

  beforeEach(() => {
    provider = new TestP24Provider();
  });

  it("initiatePayment converts amount to grosze", async () => {
    const mockRegister = vi.fn().mockResolvedValue({
      responseCode: 0,
      data: { token: "test-token" },
    });
    provider["p24Api"].registerTransaction = mockRegister;

    await provider.initiatePayment({
      currency_code: "PLN",
      amount: 49.99,
      context: { idempotency_key: "session-123" },
    } as any);

    expect(mockRegister).toHaveBeenCalledOnce();
    expect(mockRegister.mock.calls[0][0].amount).toBe(4999);
  });

  it("refundPayment converts amount to grosze", async () => {
    const mockRefund = vi.fn().mockResolvedValue({
      responseCode: 0,
      data: [{ orderId: 1, status: true, message: "OK" }],
    });
    provider["p24Api"].processRefund = mockRefund;

    await provider.refundPayment({
      data: {
        session_id: "session-123",
        order_id: 1,
        currency: "PLN",
      },
      amount: 30,
      context: { idempotency_key: "refund-key-1" },
    } as any);

    expect(mockRefund).toHaveBeenCalledOnce();
    expect(mockRefund.mock.calls[0][0].refunds[0].amount).toBe(3000);
  });

  it("refundPayment uses currency field when currency_code is missing", async () => {
    const mockRefund = vi.fn().mockResolvedValue({
      responseCode: 0,
      data: [{ orderId: 1, status: true, message: "OK" }],
    });
    provider["p24Api"].processRefund = mockRefund;

    await provider.refundPayment({
      data: {
        session_id: "session-123",
        order_id: 1,
        currency: "EUR",
      },
      amount: 30.5,
      context: { idempotency_key: "refund-key-2" },
    } as any);

    expect(mockRefund).toHaveBeenCalledOnce();
    expect(mockRefund.mock.calls[0][0].refunds[0].amount).toBe(3050);
  });

  it("refundPayment requires idempotency key", async () => {
    await expect(
      provider.refundPayment({
        data: {
          session_id: "session-123",
          order_id: 1,
          currency: "PLN",
        },
        amount: 30,
        context: {},
      } as any),
    ).rejects.toThrow("idempotency key");
  });
});

describe("P24Base – findMedusaPaymentSessionId", () => {
  it("returns payses id without touching container query", async () => {
    const provider = new TestP24ProviderWithThrowingQuery();

    await expect(
      provider["findMedusaPaymentSessionId"](
        "payses_01KVA2PDHS1FRFK30KJMGSMJE7",
      ),
    ).resolves.toBe("payses_01KVA2PDHS1FRFK30KJMGSMJE7");
  });

  it("falls back to raw session id when query is unavailable", async () => {
    const provider = new TestP24ProviderWithThrowingQuery();

    await expect(
      provider["findMedusaPaymentSessionId"]("custom-p24-session"),
    ).resolves.toBe("custom-p24-session");
  });
});
