import { describe, expect, it } from "vitest";

import { P24ApiService } from "../p24-api";
import P24CardsService from "../p24-cards";

const TEST_OPTIONS = {
  merchant_id: "12345",
  pos_id: "12345",
  api_key: "test_api_key",
  crc: "test_crc",
  sandbox: true,
  frontend_url: "http://localhost:3000",
  backend_url: "http://localhost:9000",
};

describe("P24CardsService.createCardTokenizationIntent", () => {
  it("returns widget params with a fresh session id and no side effects", () => {
    const service = new P24CardsService({}, TEST_OPTIONS);

    const intent = service.createCardTokenizationIntent({
      amount: 25,
      currency_code: "PLN",
    });

    expect(intent.merchant_id).toBe(12345);
    expect(intent.session_id).toMatch(/[0-9a-f-]{36}/i);
    expect(intent.amount_grosze).toBe(2500);
    expect(intent.currency_code).toBe("PLN");
  });

  it("signs the tokenization payload against the generated session id", () => {
    const service = new P24CardsService({}, TEST_OPTIONS);

    const intent = service.createCardTokenizationIntent({
      amount: 10,
      currency_code: "PLN",
    });

    const api = new P24ApiService(TEST_OPTIONS);

    expect(intent.card_tokenization_sign).toBe(
      api.generateCardTokenizationSign(intent.session_id),
    );
  });

  it("generates a unique session id per call", () => {
    const service = new P24CardsService({}, TEST_OPTIONS);

    const first = service.createCardTokenizationIntent({
      amount: 10,
      currency_code: "PLN",
    });
    const second = service.createCardTokenizationIntent({
      amount: 10,
      currency_code: "PLN",
    });

    expect(first.session_id).not.toBe(second.session_id);
  });
});
