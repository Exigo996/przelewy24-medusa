import { describe, expect, it, vi } from "vitest";

import { fetchTransactionDetailsAndStatus } from "../p24-transaction-status";

describe("fetchTransactionDetailsAndStatus", () => {
  const buildError = (message: string, error?: unknown) =>
    Object.assign(new Error(message), { cause: error });

  const deps = {
    p24Api: {
      getTransactionBySessionId: vi.fn(),
    },
    logger: { debug: vi.fn() },
    buildError,
  };

  it("throws when P24 status is not a valid integer", async () => {
    deps.p24Api.getTransactionBySessionId.mockResolvedValue({
      responseCode: 0,
      data: { status: "not-a-number" },
    });

    await expect(
      fetchTransactionDetailsAndStatus(deps as never, "session-1"),
    ).rejects.toThrow("Invalid transaction status received from P24");
  });

  it("maps valid integer status to Medusa status", async () => {
    deps.p24Api.getTransactionBySessionId.mockResolvedValue({
      responseCode: 0,
      data: { status: "2" },
    });

    const result = await fetchTransactionDetailsAndStatus(
      deps as never,
      "session-1",
    );

    expect(result.p24Status).toBe(2);
    expect(result.medusaStatus).toBe("captured");
  });
});
