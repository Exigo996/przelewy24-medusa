import { describe, expect, it } from "vitest";

import {
  isAllowedP24WebhookSourceIp,
  P24_WEBHOOK_ALLOWED_CIDRS,
  P24_WEBHOOK_ALLOWED_IPS,
} from "../p24-webhook-ips";

describe("isAllowedP24WebhookSourceIp", () => {
  it("allows documented single P24 IPs", () => {
    for (const ip of P24_WEBHOOK_ALLOWED_IPS) {
      expect(isAllowedP24WebhookSourceIp(ip)).toBe(true);
    }
  });

  it("allows documented P24 CIDR ranges", () => {
    const samples: Record<(typeof P24_WEBHOOK_ALLOWED_CIDRS)[number], string> =
      {
        "193.178.213.0/24": "193.178.213.42",
        "91.220.177.0/24": "91.220.177.10",
        "20.215.183.48/28": "20.215.183.50",
        "134.112.88.8/29": "134.112.88.9",
      };

    for (const cidr of P24_WEBHOOK_ALLOWED_CIDRS) {
      expect(isAllowedP24WebhookSourceIp(samples[cidr])).toBe(true);
    }
  });

  it("rejects unknown IPs", () => {
    expect(isAllowedP24WebhookSourceIp("162.158.172.83")).toBe(false);
    expect(isAllowedP24WebhookSourceIp("172.64.200.81")).toBe(false);
    expect(isAllowedP24WebhookSourceIp("203.0.113.1")).toBe(false);
  });

  it("allows sandbox localhost only when sandbox is enabled", () => {
    expect(isAllowedP24WebhookSourceIp("127.0.0.1", { sandbox: true })).toBe(
      true,
    );
    expect(isAllowedP24WebhookSourceIp("127.0.0.1", { sandbox: false })).toBe(
      false,
    );
  });
});
