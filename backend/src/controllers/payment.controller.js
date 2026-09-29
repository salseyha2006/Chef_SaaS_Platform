const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { chargeSubscription } = require('../services/subscription.service');
const { generateInvoicePdfBuffer } = require('../services/pdf.service');
const { sendReceiptEmail } = require('../services/email.service');

async function sendReceiptEmailInBackground(chef, plan, transaction) {
  try {
    const invoiceData = { ...transaction, plan, chef };
    const pdfBuffer = await generateInvoicePdfBuffer({ transaction: invoiceData, language: chef.language });
    await sendReceiptEmail({ toEmail: chef.email, transaction: invoiceData, language: chef.language, pdfBuffer });
  } catch (err) {
    console.error('Failed to send receipt email:', err);
  }
}

// US-20: Retry Failed Payment (Scenario 2: chef may switch payment method before retrying)
const retryPayment = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { paymentMethod, savedPaymentMethodId } = req.body;

  const oldTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { plan: true },
  });

  if (!oldTransaction || oldTransaction.chefId !== req.chef.id) {
    throw ApiError.notFound('Transaction not found', { code: 'TRANSACTION_NOT_FOUND' });
  }
  if (oldTransaction.status !== 'FAILED') {
    throw ApiError.badRequest('Only failed transactions can be retried', [], {
      code: 'PAYMENT_RETRY_NOT_ALLOWED',
    });
  }

  const chef = await prisma.chef.findUnique({ where: { id: req.chef.id } });

  const { success, transaction } = await chargeSubscription({
    chef,
    plan: oldTransaction.plan,
    paymentMethod: paymentMethod || oldTransaction.paymentMethod,
    savedPaymentMethodId,
    subscriptionId: oldTransaction.subscriptionId,
  });

  if (!success) {
    throw ApiError.badRequest(`Retry failed: ${transaction.failureReason}`, [
      { transactionId: transaction.id },
    ], {
      code: 'PAYMENT_RETRY_FAILED',
      params: { reason: transaction.failureReason, transactionId: transaction.id },
    });
  }

  if (oldTransaction.subscriptionId) {
    const plan = oldTransaction.plan;
    const endDate = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
    await prisma.subscription.update({
      where: { id: oldTransaction.subscriptionId },
      data: { status: 'ACTIVE', endDate, retryCount: 0 }, // resolved — reset the retry counter
    });
  }

  sendReceiptEmailInBackground(chef, oldTransaction.plan, transaction);

  return new ApiResponse(200, transaction, 'Payment retried successfully').send(res);
});

module.exports = { retryPayment };