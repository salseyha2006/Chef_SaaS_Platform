const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { chargeSubscription } = require('../services/subscription.service');

// US-20: Retry Failed Payment
const retryPayment = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const oldTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { plan: true },
  });

  if (!oldTransaction || oldTransaction.chefId !== req.chef.id) {
    throw ApiError.notFound('Transaction not found', { code: 'TRANSACTION_NOT_FOUND' });
  }
  if (oldTransaction.status !== 'FAILED') {
    throw ApiError.badRequest('Only failed transactions can be retried', [], { code: 'PAYMENT_RETRY_NOT_ALLOWED' });
  }

  const chef = await prisma.chef.findUnique({ where: { id: req.chef.id } });

  const { success, transaction } = await chargeSubscription({
    chef,
    plan: oldTransaction.plan,
    paymentMethod: oldTransaction.paymentMethod,
    subscriptionId: oldTransaction.subscriptionId,
  });

  if (!success) {
    throw ApiError.badRequest(
      `Retry failed: ${transaction.failureReason}`,
      [{ transactionId: transaction.id }],
      {
        code: 'PAYMENT_RETRY_FAILED',
        params: { reason: transaction.failureReason, transactionId: transaction.id },
      }
    );
  }

  if (oldTransaction.subscriptionId) {
    const plan = oldTransaction.plan;
    const endDate = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
    await prisma.subscription.update({
      where: { id: oldTransaction.subscriptionId },
      data: { status: 'ACTIVE', endDate },
    });
  }

  return new ApiResponse(200, transaction, 'Payment retried successfully').send(res);
});

module.exports = { retryPayment };
