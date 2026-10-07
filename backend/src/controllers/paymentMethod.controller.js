const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getSavedPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await prisma.savedPaymentMethod.findMany({
    where: { chefId: req.chef.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    select: { id: true, provider: true, last4: true, brand: true, isDefault: true, createdAt: true },
  });
  return new ApiResponse(200, methods, 'Saved payment methods fetched successfully').send(res);
});

const addSavedPaymentMethod = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { provider, gatewayToken, last4, brand, isDefault } = req.body;

  const existingCount = await prisma.savedPaymentMethod.count({ where: { chefId } });
  const shouldBeDefault = isDefault || existingCount === 0;

  const saved = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.savedPaymentMethod.updateMany({ where: { chefId }, data: { isDefault: false } });
    }
    return tx.savedPaymentMethod.create({
      data: { chefId, provider, gatewayToken, last4, brand, isDefault: shouldBeDefault },
    });
  });

  return new ApiResponse(
    201,
    { id: saved.id, provider: saved.provider, last4: saved.last4, brand: saved.brand, isDefault: saved.isDefault },
    'Payment method saved successfully'
  ).send(res);
});

const setDefaultPaymentMethod = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const method = await prisma.savedPaymentMethod.findUnique({ where: { id } });
  if (!method || method.chefId !== chefId) {
    throw ApiError.notFound('Saved payment method not found', { code: 'PAYMENT_METHOD_NOT_FOUND' });
  }

  await prisma.$transaction([
    prisma.savedPaymentMethod.updateMany({ where: { chefId }, data: { isDefault: false } }),
    prisma.savedPaymentMethod.update({ where: { id }, data: { isDefault: true } }),
  ]);

  return new ApiResponse(200, null, 'Default payment method updated').send(res);
});

const deleteSavedPaymentMethod = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const method = await prisma.savedPaymentMethod.findUnique({ where: { id } });
  if (!method || method.chefId !== chefId) {
    throw ApiError.notFound('Saved payment method not found', { code: 'PAYMENT_METHOD_NOT_FOUND' });
  }

  await prisma.savedPaymentMethod.delete({ where: { id } });

  if (method.isDefault) {
    const next = await prisma.savedPaymentMethod.findFirst({
      where: { chefId },
      orderBy: { createdAt: 'desc' },
    });
    if (next) {
      await prisma.savedPaymentMethod.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  return new ApiResponse(200, null, 'Payment method removed successfully').send(res);
});

module.exports = {
  getSavedPaymentMethods,
  addSavedPaymentMethod,
  setDefaultPaymentMethod,
  deleteSavedPaymentMethod,
};
