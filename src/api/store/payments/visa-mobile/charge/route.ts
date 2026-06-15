import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

import P24VisaMobileService from "../../../../../providers/przelewy24/services/p24-visa-mobile";
import {
  handleP24Charge,
  parseP24ChargeResponse,
  resolveP24Provider,
} from "../../utils/charge-helper";
import { PaymentProviderKeys } from "../../../../../providers/przelewy24/types";

const PL_PHONE_REGEX = /^(\+?48)?\d{9}$/;

function normalizePolishPhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.length === 9) {
    return `48${digitsOnly}`;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith("48")) {
    return digitsOnly;
  }

  throw new Error("Invalid Polish mobile phone number");
}

const visaMobileChargeSchema = z.object({
  token: z.string().min(1, "Token is required").max(200, "Token is too long"),
  phone: z
    .string()
    .min(9, "Phone number is required")
    .max(15, "Phone number is too long")
    .regex(PL_PHONE_REGEX, "Invalid Polish mobile phone number"),
  payment_session_id: z.string().min(1).optional(),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validationResult = visaMobileChargeSchema.safeParse(req.body);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`,
    );

    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  const { token, phone, payment_session_id } = validationResult.data;

  try {
    const normalizedPhone = normalizePolishPhone(phone);
    const provider = resolveP24Provider<P24VisaMobileService>(
      req,
      PaymentProviderKeys.P24_VISA_MOBILE,
    );

    const result = await handleP24Charge({
      req,
      paymentSessionId: payment_session_id,
      execute: async () => {
        const response = await provider.chargeVisaMobilePayment(
          token,
          normalizedPhone,
        );
        return parseP24ChargeResponse(response);
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Visa Mobile payment failed";

    return res.status(400).json({
      error: "Visa Mobile payment failed",
      message,
    });
  }
}
