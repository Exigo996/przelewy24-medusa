"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactUnknown = redactUnknown;
exports.createP24Logger = createP24Logger;
const SENSITIVE_KEYS = new Set([
    "email",
    "clientemail",
    "clientname",
    "clientaddres",
    "clientaddress",
    "clientcity",
    "clientpostcode",
    "cardnumber",
    "cvv",
    "blikcode",
    "phone",
    "authorizationcode",
    "useragent",
    "ip",
]);
function redactValue(key, value) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        return "[REDACTED]";
    }
    if (Array.isArray(value)) {
        return value.map((item) => redactUnknown(item));
    }
    if (value && typeof value === "object") {
        return redactUnknown(value);
    }
    return value;
}
function redactUnknown(value) {
    if (Array.isArray(value)) {
        return value.map((item) => redactUnknown(item));
    }
    if (!value || typeof value !== "object") {
        return value;
    }
    const output = {};
    for (const [key, nestedValue] of Object.entries(value)) {
        output[key] = redactValue(key, nestedValue);
    }
    return output;
}
function createP24Logger(logger, debugEnabled) {
    const safeLogger = logger ?? console;
    return {
        debug: (message) => {
            if (debugEnabled) {
                safeLogger.debug(message);
            }
        },
        info: (message) => safeLogger.info(message),
        warn: (message) => safeLogger.warn(message),
        error: (message) => safeLogger.error(message),
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LWxvZ2dlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy91dGlscy9wMjQtbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBaUNBLHNDQWdCQztBQVNELDBDQWdCQztBQTFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQztJQUM3QixPQUFPO0lBQ1AsYUFBYTtJQUNiLFlBQVk7SUFDWixjQUFjO0lBQ2QsZUFBZTtJQUNmLFlBQVk7SUFDWixnQkFBZ0I7SUFDaEIsWUFBWTtJQUNaLEtBQUs7SUFDTCxVQUFVO0lBQ1YsT0FBTztJQUNQLG1CQUFtQjtJQUNuQixXQUFXO0lBQ1gsSUFBSTtDQUNMLENBQUMsQ0FBQztBQUVILFNBQVMsV0FBVyxDQUFDLEdBQVcsRUFBRSxLQUFjO0lBQzlDLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzFDLE9BQU8sWUFBWSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUN6QixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUFJLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUN2QyxPQUFPLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLEtBQWM7SUFDMUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDekIsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUN4QyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxNQUFNLE1BQU0sR0FBNEIsRUFBRSxDQUFDO0lBRTNDLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDdkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFTRCxTQUFnQixlQUFlLENBQzdCLE1BQThCLEVBQzlCLFlBQXFCO0lBRXJCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxPQUFPLENBQUM7SUFFckMsT0FBTztRQUNMLEtBQUssRUFBRSxDQUFDLE9BQWUsRUFBRSxFQUFFO1lBQ3pCLElBQUksWUFBWSxFQUFFLENBQUM7Z0JBQ2pCLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUIsQ0FBQztRQUNILENBQUM7UUFDRCxJQUFJLEVBQUUsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ25ELElBQUksRUFBRSxDQUFDLE9BQWUsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDbkQsS0FBSyxFQUFFLENBQUMsT0FBZSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztLQUN0RCxDQUFDO0FBQ0osQ0FBQyJ9