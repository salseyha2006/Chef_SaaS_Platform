const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createPdfDocument, writeInvoicePdf } = require('../services/pdf.service');

const VALID_TRANSACTION_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];

// US-22: View Transaction History (Scenario 1, 2, 3, 4 — list, empty state, filter, pagination)
const getTransactionHistory = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  // Unknown/invalid status values are simply ignored (no filter applied) rather than erroring —
  // consistent with how other query filters (archived, tag) are handled elsewhere in this API.
  const status = VALID_TRANSACTION_STATUSES.includes(req.query.status) ? req.query.status : undefined;

  const where = { chefId, status };

  const [items, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return new ApiResponse(
    200,
    { items, pagination: { page, limit, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / limit)) } },
    'Transaction history fetched successfully'
  ).send(res);
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

// US-23 Scenario 2/3: Download Invoice (PDF) — only for successful transactions
const downloadInvoice = asyncHandler(async (req, res) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: req.params.id },
    include: { plan: true, chef: true },
  });

  if (!transaction || transaction.chefId !== req.chef.id) {
    throw ApiError.notFound('Transaction not found', { code: 'TRANSACTION_NOT_FOUND' });
  }

  if (transaction.status !== 'SUCCESS') {
    throw ApiError.badRequest(
      'Invoice is only available for successful transactions',
      [],
      { code: 'INVOICE_NOT_AVAILABLE' }
    );
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

module.exports = {
  getTransactionHistory,
  getTransactionDetail,
  downloadInvoice,
  updateBillingInfo,
};