const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createPdfDocument, writeInvoicePdf } = require('../services/pdf.service');


// US-22: View Transaction History
const getTransactionHistory = asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { chefId: req.chef.id },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });
  return new ApiResponse(200, transactions, 'Transaction history fetched successfully').send(res);
});

// US-23: View Transaction Detail
const getTransactionDetail = asyncHandler(async (req, res) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: req.params.id },
    include: { plan: true, chef: { select: { email: true, displayName: true } } },
  });

  if (!transaction || transaction.chefId !== req.chef.id) {
    throw ApiError.notFound('Transaction not found', { code: 'TRANSACTION_NOT_FOUND' });
  }

  return new ApiResponse(200, transaction, 'Transaction detail fetched successfully').send(res);
});

// US-23: Download Invoice (PDF)
const downloadInvoice = asyncHandler(async (req, res) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: req.params.id },
    include: { plan: true, chef: true },
  });

  if (!transaction || transaction.chefId !== req.chef.id) {
    throw ApiError.notFound('Transaction not found', { code: 'TRANSACTION_NOT_FOUND' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${transaction.invoiceNumber}.pdf`);

  const doc = createPdfDocument();
  doc.pipe(res);
  writeInvoicePdf(doc, { transaction, language: transaction.chef.language });
  doc.end();
});

// US-24: Update Billing Information
const updateBillingInfo = asyncHandler(async (req, res) => {
  const { billingName, shopAddress, phoneNumber } = req.body;

  const billingInfo = await prisma.billingInfo.upsert({
    where: { chefId: req.chef.id },
    update: { billingName, shopAddress, phoneNumber },
    create: { chefId: req.chef.id, billingName, shopAddress, phoneNumber },
  });

  return new ApiResponse(200, billingInfo, 'Billing information updated successfully').send(res);
});

// US-25: Request Refund
const requestRefund = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const transaction = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!transaction || transaction.chefId !== req.chef.id) {
    throw ApiError.notFound('Transaction not found', { code: 'TRANSACTION_NOT_FOUND' });
  }
  if (transaction.status !== 'SUCCESS') {
    throw ApiError.badRequest('Only successful transactions can be refunded', [], { code: 'REFUND_NOT_ALLOWED' });
  }
  if (transaction.refundStatus) {
    throw ApiError.conflict('A refund has already been requested for this transaction', { code: 'REFUND_ALREADY_REQUESTED' });
  }

  const updated = await prisma.transaction.update({
    where: { id: transaction.id },
    data: { refundStatus: 'REQUESTED', refundReason: reason },
  });

  return new ApiResponse(200, updated, 'Refund request submitted successfully').send(res);
});

module.exports = {
  getTransactionHistory,
  getTransactionDetail,
  downloadInvoice,
  updateBillingInfo,
  requestRefund,
};
