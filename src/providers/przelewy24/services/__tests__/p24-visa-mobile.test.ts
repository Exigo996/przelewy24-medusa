import { describe, expect, it } from "vitest";

import P24VisaMobileService from "../p24-visa-mobile";
import {
  DEFAULT_VISA_MOBILE_METHOD_ID,
  PaymentProviderKeys,
} from "../../types";

const TEST_OPTIONS = {
  merchant_id: "12345",
  pos_id: "12345",
  api_key: "test_api_key",
  crc: "test_crc",
  sandbox: true,
  frontend_url: "http://localhost:3000",
  backend_url: "http://localhost:9000",
};

describe("P24VisaMobileService", () => {
  it("pins Visa Mobile method id and uses redirect mode by default", () => {
    const service = new P24VisaMobileService({}, TEST_OPTIONS);

    expect(service.paymentIntentOptions).toEqual({
      method_id: DEFAULT_VISA_MOBILE_METHOD_ID,
      description: "Payment via Przelewy24 - Visa Mobile",
      white_label: false,
    });
  });

  it("allows overriding visa_mobile_method_id", () => {
    const service = new P24VisaMobileService({}, {
      ...TEST_OPTIONS,
      visa_mobile_method_id: 199,
    });

    expect(service.paymentIntentOptions.method_id).toBe(199);
    expect(service.paymentIntentOptions.white_label).toBe(false);
  });

  it("exposes the Visa Mobile provider key", () => {
    const service = new P24VisaMobileService({}, TEST_OPTIONS);

    expect(P24VisaMobileService.identifier).toBe(
      PaymentProviderKeys.P24_VISA_MOBILE,
    );
    expect(service.paymentIntentOptions.white_label).toBe(false);
  });
});
