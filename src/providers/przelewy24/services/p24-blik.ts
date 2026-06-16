import P24Base from "../core/p24-base";
import {
  BlikOptions,
  DEFAULT_BLIK_CHANNEL,
  P24PaymentIntentOptions,
  PaymentProviderKeys,
} from "../types";
import { coerceSandbox } from "../../../utils/coerce-sandbox";

class P24BlikService extends P24Base {
  static identifier = PaymentProviderKeys.P24_BLIK;

  private readonly blikOptions_: BlikOptions;

  constructor(cradle: Record<string, unknown>, options: BlikOptions) {
    const normalizedOptions: BlikOptions = {
      ...options,
      sandbox: coerceSandbox(options.sandbox),
      channel: options.channel ?? DEFAULT_BLIK_CHANNEL,
      white_label: options.white_label ?? true,
    };

    super(cradle, normalizedOptions);
    this.blikOptions_ = normalizedOptions;
  }

  get paymentIntentOptions(): P24PaymentIntentOptions {
    return {
      channel: this.blikOptions_.channel ?? DEFAULT_BLIK_CHANNEL,
      description: "Payment via Przelewy24 - BLIK",
      white_label: this.blikOptions_.white_label ?? true,
    };
  }

  protected getProviderKey(): string {
    return PaymentProviderKeys.P24_BLIK;
  }

  async chargeBlikPayment(token: string, blikCode: string) {
    return this.p24Api.chargeBlikByCode({
      token,
      blikCode,
    });
  }
}

export default P24BlikService;
