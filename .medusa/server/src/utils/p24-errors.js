"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapP24ErrorCode = mapP24ErrorCode;
exports.extractP24ErrorCode = extractP24ErrorCode;
exports.buildLocalizedP24ErrorMessage = buildLocalizedP24ErrorMessage;
const P24_ERROR_MESSAGES = {
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
function normalizeP24Code(code) {
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
function mapP24ErrorCode(code, locale = "pl") {
    if (code == null) {
        return undefined;
    }
    const normalized = normalizeP24Code(code);
    const message = P24_ERROR_MESSAGES[normalized];
    return message?.[locale] ?? message?.en;
}
function extractP24ErrorCode(payload) {
    if (!payload || typeof payload !== "object") {
        return undefined;
    }
    const record = payload;
    const responseCode = record.responseCode;
    if (typeof responseCode === "number" && responseCode !== 0) {
        return normalizeP24Code(responseCode);
    }
    const data = record.data;
    if (data && typeof data === "object") {
        const dataRecord = data;
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
function buildLocalizedP24ErrorMessage(payload, fallbackMessage, locale = "pl") {
    const code = extractP24ErrorCode(payload);
    const mapped = code ? mapP24ErrorCode(code, locale) : undefined;
    if (mapped) {
        return mapped;
    }
    if (payload && typeof payload === "object") {
        const record = payload;
        const data = record.data;
        if (data && typeof data === "object") {
            const message = data.message;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LWVycm9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlscy9wMjQtZXJyb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBNEVBLDBDQVlDO0FBRUQsa0RBNEJDO0FBRUQsc0VBNkJDO0FBaEpELE1BQU0sa0JBQWtCLEdBQXFDO0lBQzNELEtBQUssRUFBRTtRQUNMLEVBQUUsRUFBRSxrQ0FBa0M7UUFDdEMsRUFBRSxFQUFFLDBCQUEwQjtLQUMvQjtJQUNELEtBQUssRUFBRTtRQUNMLEVBQUUsRUFBRSwrQkFBK0I7UUFDbkMsRUFBRSxFQUFFLDRCQUE0QjtLQUNqQztJQUNELEtBQUssRUFBRTtRQUNMLEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsRUFBRSxFQUFFLG9CQUFvQjtLQUN6QjtJQUNELEtBQUssRUFBRTtRQUNMLEVBQUUsRUFBRSwyREFBMkQ7UUFDL0QsRUFBRSxFQUFFLDZEQUE2RDtLQUNsRTtJQUNELEtBQUssRUFBRTtRQUNMLEVBQUUsRUFBRSxrQ0FBa0M7UUFDdEMsRUFBRSxFQUFFLDRCQUE0QjtLQUNqQztJQUNELEtBQUssRUFBRTtRQUNMLEVBQUUsRUFBRSxvQ0FBb0M7UUFDeEMsRUFBRSxFQUFFLDhCQUE4QjtLQUNuQztJQUNELEtBQUssRUFBRTtRQUNMLEVBQUUsRUFBRSxvQ0FBb0M7UUFDeEMsRUFBRSxFQUFFLGdDQUFnQztLQUNyQztJQUNELEtBQUssRUFBRTtRQUNMLEVBQUUsRUFBRSxvQ0FBb0M7UUFDeEMsRUFBRSxFQUFFLHFCQUFxQjtLQUMxQjtJQUNELE1BQU0sRUFBRTtRQUNOLEVBQUUsRUFBRSx1Q0FBdUM7UUFDM0MsRUFBRSxFQUFFLHdDQUF3QztLQUM3QztJQUNELE1BQU0sRUFBRTtRQUNOLEVBQUUsRUFBRSx3Q0FBd0M7UUFDNUMsRUFBRSxFQUFFLDBDQUEwQztLQUMvQztJQUNELE1BQU0sRUFBRTtRQUNOLEVBQUUsRUFBRSxpQ0FBaUM7UUFDckMsRUFBRSxFQUFF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