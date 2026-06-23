"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobErrorMessage = getJobErrorMessage;
exports.isExpectedStalePaymentJobFailure = isExpectedStalePaymentJobFailure;
function getJobErrorMessage(error) {
    if (error instanceof Error) {
        if (error.cause) {
            const causeMessage = getJobErrorMessage(error.cause);
            if (causeMessage && causeMessage !== error.message) {
                return `${error.message}: ${causeMessage}`;
            }
        }
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object') {
        const record = error;
        if (typeof record.message === 'string') {
            return record.message;
        }
        if (record.error) {
            return getJobErrorMessage(record.error);
        }
        if (Array.isArray(record.errors) && record.errors.length > 0) {
            return getJobErrorMessage(record.errors[0]);
        }
    }
    return 'unknown';
}
function isExpectedStalePaymentJobFailure(error) {
    const message = getJobErrorMessage(error).toLowerCase();
    return (message.includes('404') ||
        message.includes('not found') ||
        message.includes('400 bad request') ||
        message.includes('verification failed'));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudC1qb2ItZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL3BheW1lbnQtam9iLWVycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQWtDQztBQUVELDRFQVNDO0FBN0NELFNBQWdCLGtCQUFrQixDQUFDLEtBQWM7SUFDL0MsSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFLENBQUM7UUFDM0IsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEIsTUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBRXBELElBQUksWUFBWSxJQUFJLFlBQVksS0FBSyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25ELE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxLQUFLLFlBQVksRUFBRSxDQUFBO1lBQzVDLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFBO0lBQ3RCLENBQUM7SUFFRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzlCLE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQUVELElBQUksS0FBSyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLEtBQWdDLENBQUE7UUFFL0MsSUFBSSxPQUFPLE1BQU0sQ0FBQyxPQUFPLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdkMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFBO1FBQ3ZCLENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQixPQUFPLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUN6QyxDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM3RCxPQUFPLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QyxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sU0FBUyxDQUFBO0FBQ2xCLENBQUM7QUFFRCxTQUFnQixnQ0FBZ0MsQ0FBQyxLQUFjO0lBQzdELE1BQU0sT0FBTyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBRXZELE9BQU8sQ0FDTCxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUN2QixPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUM3QixPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDO1FBQ25DLE9BQU8sQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FDeEMsQ0FBQTtBQUNILENBQUMifQ==