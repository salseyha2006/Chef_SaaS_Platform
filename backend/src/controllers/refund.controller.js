const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paymentService = require('../services/payment.service');
const { sendRefundApprovedEmail, sendRefundRejectedEmail } = require('../services/email.service');

const REFUND_WINDOW_DAYS = 7; // US-25 Technical Note: configurable, not hardcoded across logic

// US-25 Scenario 1/2: Request Refund (chef-facing)
const requestRefund = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!transaction || transaction.chefId !== req.chef.id) {
    throw ApiError.notFound('Transaction not found', { code: 'TRANSACTION_NOT_FOUND' });
  }
  if (transaction.status !== 'SUCCESS') {
    throw ApiError.badRequest('Only successful transactions can be refunded', [], {
      code: 'REFUND_NOT_ALLOWED',
    });
  }
  if (transaction.refundStatus) {
    throw ApiError.conflict('A refund has already been requested for this transaction', {
      code: 'REFUND_ALREADY_REQUESTED',
    });
  }

  const windowEnd = new Date(transaction.createdAt.getTime() + REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  if (new Date() > windowEnd) {
    throw ApiError.badRequest(
      `The refund request window (${REFUND_WINDOW_DAYS} days) for this transaction has passed`,
      [],
      { code: 'REFUND_WINDOW_EXPIRED', params: { days: REFUND_WINDOW_DAYS } }
    );
  }

  const updated = await prisma.transaction.update({
    where: { id: transaction.id },
    data: { refundStatus: 'REQUESTED', refundReason: reason },
  });

  return new ApiResponse(200, updated, 'Refund request submitted successfully').send(res);
});

// Admin: list all pending refund requests across every chef
const getPendingRefundRequests = asyncHandler(async (req, res) => {
  const requests = await prisma.transaction.findMany({
    where: { refundStatus: 'REQUESTED' },
    include: { plan: true, chef: { select: { id: true, email: true, displayName: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return new ApiResponse(200, requests, 'Pending refund requests fetched successfully').send(res);
});

// Admin US-25 Scenario 3: Approve — calls the gateway refund API automatically
const approveRefund = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const adminId = req.headers['x-admin-secret']; // stub: no real admin identity yet, see requireAdminSecret

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { plan: true, chef: true, subscription: true },
  });
  if (!transaction) throw ApiError.notFound('Transaction not found', { code: 'TRANSACTION_NOT_FOUND' });
  if (transaction.refundStatus !== 'REQUESTED') {
    throw ApiError.badRequest('This transaction has no pending refund request', [], {
      code: 'REFUND_NOT_PENDING',
    });
  }

  const idempotencyKey = `refund-${transaction.id}`;
  const result = await paymentService.refund(transaction.paymentMethod, {
    gatewayRef: transaction.gatewayRef,
    amount: transaction.amount,
    idempotencyKey,
  });

  if (!result.success) {
    throw ApiError.badRequest(
      `Refund failed at the gateway: ${result.failureReason}`,
      [],
      { code: 'REFUND_GATEWAY_FAILED', params: { reason: result.failureReason } }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedTransaction = await tx.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'REFUNDED',
        refundStatus: 'APPROVED',
        refundReviewedBy: 'admin', // stub — replace with real admin identity once admin auth exists
        refundReviewedAt: new Date(),
      },
    });

    // US-25 Technical Note: sync subscription access — a refunded cycle should not keep access active
    if (
      transaction.subscriptionId &&
      transaction.subscription &&
      transaction.subscription.status === 'ACTIVE'
    ) {
      await tx.subscription.update({
        where: { id: transaction.subscriptionId },
        data: { status: 'EXPIRED' },
      });
    }

    return updatedTransaction;
  });

  sendRefundApprovedEmail({
    toEmail: transaction.chef.email,
    language: transaction.chef.language,
    transaction,
  }).catch((err) => console.error('Failed to send refund-approved email:', err));

  return new ApiResponse(200, updated, 'Refund approved and processed successfully').send(res);
});

// Admin US-25 Scenario 4: Reject
const rejectRefund = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { reason } = req.body;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { chef: true },
  });
  if (!transaction) throw ApiError.notFound('Transaction not found', { code: 'TRANSACTION_NOT_FOUND' });
  if (transaction.refundStatus !== 'REQUESTED') {
    throw ApiError.badRequest('This transaction has no pending refund request', [], {
      code: 'REFUND_NOT_PENDING',
    });
  }

  const updated = await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      refundStatus: 'REJECTED',
      refundReason: reason,
      refundReviewedBy: 'admin',
      refundReviewedAt: new Date(),
    },
  });

  sendRefundRejectedEmail({
    toEmail: transaction.chef.email,
    language: transaction.chef.language,
    transaction,
    reason,
  }).catch((err) => console.error('Failed to send refund-rejected email:', err));

  return new ApiResponse(200, updated, 'Refund request rejected').send(res);
});

module.exports = { requestRefund, getPendingRefundRequests, approveRefund, rejectRefund };