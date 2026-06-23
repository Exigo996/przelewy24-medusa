"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = reconcileP24PaymentsJob;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/medusa/core-flows");
const utils_2 = require("@medusajs/framework/utils");
const charge_helper_1 = require("../api/store/payments/utils/charge-helper");
const payment_job_errors_1 = require("../utils/payment-job-errors");
const P24_PROVIDER_PREFIX = 'pp_p24';
const RECONCILE_AFTER_MINUTES = 5;
const RECONCILE_MAX_AGE_HOURS = 48;
const RECONCILE_BATCH_SIZE = 50;
const RECONCILEABLE_STATUSES = ['pending', 'requires_more', 'authorized'];
function hasRegisteredP24Transaction(sessionData) {
    if (sessionData.pending_card_tokenization === true) {
        return false;
    }
    return Boolean(sessionData.token ||
        sessionData.order_id ||
        sessionData.orderId);
}
async function reconcileP24PaymentsJob(container) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const cutoff = new Date(Date.now() - RECONCILE_AFTER_MINUTES * 60 * 1000);
    const maxAge = new Date(Date.now() - RECONCILE_MAX_AGE_HOURS * 60 * 60 * 1000);
    const { data: paymentSessions } = await query.graph({
        entity: 'payment_session',
        fields: [
            'id',
            'status',
            'provider_id',
            'data',
            'amount',
            'updated_at',
            'deleted_at',
            'payment_collection.payments.id',
            'payment_collection.payments.captured_at',
        ],
        filters: {
            provider_id: { $like: `${P24_PROVIDER_PREFIX}%` },
            status: { $in: [...RECONCILEABLE_STATUSES] },
            deleted_at: null,
            updated_at: {
                $lte: cutoff.toISOString(),
                $gte: maxAge.toISOString(),
            },
        },
        pagination: {
            take: RECONCILE_BATCH_SIZE,
            order: {
                updated_at: 'DESC',
            },
        },
    });
    let reconciled = 0;
    for (const session of paymentSessions ?? []) {
        const sessionData = (session.data ?? {});
        if (!hasRegisteredP24Transaction(sessionData)) {
            continue;
        }
        const p24SessionId = sessionData.session_id ||
            sessionData.sessionId ||
            session.id;
        try {
            const providerId = session.provider_id;
            const provider = (0, charge_helper_1.resolvePaymentProviderById)(container, providerId);
            const { medusaStatus, transactionDetails } = await provider.queryTransactionStatus(p24SessionId);
            if (medusaStatus !== 'captured' && medusaStatus !== 'authorized') {
                continue;
            }
            const payments = session.payment_collection?.payments ?? [];
            const hasCapturedPayment = payments.some((payment) => Boolean(payment?.captured_at));
            if (hasCapturedPayment) {
                continue;
            }
            const p24Amount = transactionDetails.data.amount;
            const p24Currency = transactionDetails.data.currency;
            const p24OrderId = transactionDetails.data.orderId;
            // Verify the transaction server-side via P24's cryptographic
            // `/transaction/verify` before capturing, and use the P24-verified
            // amount instead of the (cart-sourced) `session.amount`.
            const verification = await provider.verifyTransaction(p24SessionId, p24Amount, p24Currency, p24OrderId);
            if (verification.responseCode !== 0 ||
                verification.data.status !== 'success') {
                logger.warn(`[p24-reconcile] Skipping session ${session.id}: P24 verification failed (responseCode: ${verification.responseCode}, status: ${verification.data.status})`);
                continue;
            }
            await (0, core_flows_1.processPaymentWorkflow)(container).run({
                input: {
                    action: utils_2.PaymentActions.SUCCESSFUL,
                    data: {
                        session_id: session.id,
                        amount: p24Amount,
                    },
                },
            });
            reconciled += 1;
        }
        catch (error) {
            const message = (0, payment_job_errors_1.getJobErrorMessage)(error);
            if ((0, payment_job_errors_1.isExpectedStalePaymentJobFailure)(error)) {
                logger.debug(`[p24-reconcile] Skipping payment session ${session.id}: ${message}`);
                continue;
            }
            logger.error(`[p24-reconcile] Failed to reconcile payment session ${session.id}: ${message}`);
        }
    }
    if (reconciled > 0) {
        logger.info(`[p24-reconcile] Reconciled ${reconciled} payment session(s)`);
    }
}
exports.config = {
    name: 'reconcile-p24-payments',
    schedule: '*/5 * * * *',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb25jaWxlLXAyNC1wYXltZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9qb2JzL3JlY29uY2lsZS1wMjQtcGF5bWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBZ0NBLDBDQW9JQztBQW5LRCxxREFBcUU7QUFDckUsNERBQW9FO0FBQ3BFLHFEQUEwRDtBQUUxRCw2RUFBOEg7QUFDOUgsb0VBR29DO0FBRXBDLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFBO0FBQ3BDLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxDQUFBO0FBQ2pDLE1BQU0sdUJBQXVCLEdBQUcsRUFBRSxDQUFBO0FBQ2xDLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFBO0FBRS9CLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxTQUFTLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBVSxDQUFBO0FBRWxGLFNBQVMsMkJBQTJCLENBQ2xDLFdBQW9DO0lBRXBDLElBQUksV0FBVyxDQUFDLHlCQUF5QixLQUFLLElBQUksRUFBRSxDQUFDO1FBQ25ELE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQUVELE9BQU8sT0FBTyxDQUNaLFdBQVcsQ0FBQyxLQUFLO1FBQ2YsV0FBVyxDQUFDLFFBQVE7UUFDcEIsV0FBVyxDQUFDLE9BQU8sQ0FDdEIsQ0FBQTtBQUNILENBQUM7QUFFYyxLQUFLLFVBQVUsdUJBQXVCLENBQ25ELFNBQTBCO0lBRTFCLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbEUsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUVoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsdUJBQXVCLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO0lB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