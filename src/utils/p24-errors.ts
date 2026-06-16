type LocalizedMessage = {
  pl: string;
  en: string;
};

const P24_ERROR_MESSAGES: Record<string, LocalizedMessage> = {
  err00: {
    pl: "Nieprawidłowe żądanie płatności.",
    en: "Invalid payment request.",
  },
  err05: {
    pl: "Nieprawidłowy podpis żądania.",
    en: "Invalid request signature.",
  },
  err54: {
    pl: "Nieprawidłowy kod BLIK.",
    en: "Invalid BLIK code.",
  },
  err55: {
    pl: "Kod BLIK wygasł. Wygeneruj nowy kod w aplikacji bankowej.",
    en: "BLIK code expired. Generate a new code in your banking app.",
  },
  err56: {
    pl: "Płatność BLIK została odrzucona.",
    en: "BLIK payment was declined.",
  },
  err57: {
    pl: "Przekroczono limit płatności BLIK.",
    en: "BLIK payment limit exceeded.",
  },
  err58: {
    pl: "Transakcja BLIK została anulowana.",
    en: "BLIK transaction was canceled.",
  },
  err59: {
    pl: "Niewystarczające środki na koncie.",
    en: "Insufficient funds.",
  },
  err101: {
    pl: "Transakcja wygasła. Spróbuj ponownie.",
    en: "Transaction expired. Please try again.",
  },
  err102: {
    pl: "Transakcja została już zarejestrowana.",
    en: "Transaction has already been registered.",
  },
  err103: {
    pl: "Nieprawidłowa kwota transakcji.",
    en: "Invalid transaction amount.",
  },
  err161: {
    pl: "Płatność kartą została odrzucona.",
    en: "Card payment was declined.",
  },
  err162: {
    pl: "Nieprawidłowe dane karty.",
    en: "Invalid card details.",
  },
};

function normalizeP24Code(code: string | number): string {
  if (typeof code === "number") {
    return `err${String(code).padStart(2, "0")}`;
  }

  const raw = code.trim().toLowerCase();
  if (raw.startsWith("err")) {
    const numericPart = raw.slice(3);
    return /^\d+$/.test(numericPart)
      ? `err${numericPart.padStart(2, "0")}`
      : raw;
  }

  return /^\d+$/.test(raw) ? `err${raw.padStart(2, "0")}` : `err${raw}`;
}

export function mapP24ErrorCode(
  code: string | number | undefined,
  locale: "pl" | "en" = "pl",
): string | undefined {
  if (code == null) {
    return undefined;
  }

  const normalized = normalizeP24Code(code);

  const message = P24_ERROR_MESSAGES[normalized];
  return message?.[locale] ?? message?.en;
}

export function extractP24ErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  const responseCode = record.responseCode;

  if (typeof responseCode === "number" && responseCode !== 0) {
    return normalizeP24Code(responseCode);
  }

  const data = record.data;
  if (data && typeof data === "object") {
    const dataRecord = data as Record<string, unknown>;
    if (typeof dataRecord.code === "string") {
      return dataRecord.code;
    }
    if (typeof dataRecord.errorCode === "string") {
      return dataRecord.errorCode;
    }
  }

  if (typeof record.code === "string") {
    return record.code;
  }

  return undefined;
}

export function buildLocalizedP24ErrorMessage(
  payload: unknown,
  fallbackMessage: string,
  locale: "pl" | "en" = "pl",
): string {
  const code = extractP24ErrorCode(payload);
  const mapped = code ? mapP24ErrorCode(code, locale) : undefined;

  if (mapped) {
    return mapped;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const data = record.data;

    if (data && typeof data === "object") {
      const message = (data as Record<string, unknown>).message;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }

    if (typeof record.message === "string" && record.message.trim().length > 0) {
      return record.message;
    }
  }

  return fallbackMessage;
}
