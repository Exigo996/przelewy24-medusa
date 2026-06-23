"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapP24StatusToMedusaStatus = mapP24StatusToMedusaStatus;
exports.fetchTransactionDetailsAndStatus = fetchTransactionDetailsAndStatus;
function mapP24StatusToMedusaStatus(p24Status) {
    switch (p24Status) {
        case 0:
            return "pending";
        case 1:
            return "authorized";
        case 2:
            return "captured";
        case 3:
            return "canceled";
        default:
            return "error";
    }
}
async function fetchTransactionDetailsAndStatus(deps, sessionId) {
    const transactionDetails = await deps.p24Api.getTransactionBySessionId(sessionId);
    if (transactionDetails.responseCode !== 0) {
        throw deps.buildError("Failed to retrieve transaction details", new Error(`P24 API error: ${transactionDetails.responseCode}`));
    }
    const p24Status = Number(transactionDetails.data.status);
    if (!Number.isInteger(p24Status)) {
        throw deps.buildError("Invalid transaction status received from P24", new Error(`Unexpected P24 status: ${String(transactionDetails.data.status)}`));
    }
    const medusaStatus = mapP24StatusToMedusaStatus(p24Status);
    deps.logger.debug(`P24 status ${p24Status} mapped to Medusa status ${medusaStatus} for session ${sessionId}`);
    return {
        transactionDetails,
        p24Status,
        medusaStatus,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicDI0LXRyYW5zYWN0aW9uLXN0YXR1cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9wcm92aWRlcnMvcHJ6ZWxld3kyNC9jb3JlL3AyNC10cmFuc2FjdGlvbi1zdGF0dXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFNQSxnRUFlQztBQVFELDRFQXdDQztBQS9ERCxTQUFnQiwwQkFBMEIsQ0FDeEMsU0FBaUI7SUFFakIsUUFBUSxTQUFTLEVBQUUsQ0FBQztRQUNsQixLQUFLLENBQUM7WUFDSixPQUFPLFNBQVMsQ0FBQztRQUNuQixLQUFLLENBQUM7WUFDSixPQUFPLFlBQVksQ0FBQztRQUN0QixLQUFLLENBQUM7WUFDSixPQUFPLFVBQVUsQ0FBQztRQUNwQixLQUFLLENBQUM7WUFDSixPQUFPLFVBQVUsQ0FBQztRQUNwQjtZQUNFLE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7QUFDSCxDQUFDO0FBUU0sS0FBSyxVQUFVLGdDQUFnQyxDQUNwRCxJQUEyQixFQUMzQixTQUFpQjtJQU1qQixNQUFNLGtCQUFrQixHQUN0QixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFekQsSUFBSSxrQkFBa0IsQ0FBQyxZQUFZLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDMUMsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUNuQix3Q0FBd0MsRUFDeEMsSUFBSSxLQUFLLENBQUMsa0JBQWtCLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQy9ELENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV6RCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FDbkIsOENBQThDLEVBQzlDLElBQUksS0FBSyxDQUNQLDBCQUEwQixNQUFNLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQ25FLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLFlBQVksR0FBRywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUUzRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDZixjQUFjLFNBQVMsNEJBQTRCLFlBQVksZ0JBQWdCLFNBQVMsRUFBRSxDQUMzRixDQUFDO0lBRUYsT0FBTztRQUNMLGtCQUFrQjtRQUNsQixTQUFTO1FBQ1QsWUFBWTtLQUNiLENBQUM7QUFDSixDQUFDIn0=