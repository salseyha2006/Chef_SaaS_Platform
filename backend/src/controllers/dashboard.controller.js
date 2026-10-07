const prisma = require('../config/db');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [upcomingEvents, dishCount, menuSetCount, monthlySpending, subscription] = await Promise.all([
    prisma.event.findMany({
      where: { chefId, eventDate: { gte: now } },
      orderBy: { eventDate: 'asc' },
      take: 5,
    }),
    prisma.dish.count({ where: { chefId, isArchived: false } }),
    prisma.menuSet.count({ where: { chefId, isArchived: false } }),
    prisma.transaction.aggregate({
      where: { chefId, status: 'SUCCESS', createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.subscription.findUnique({ where: { chefId }, include: { plan: true } }),
  ]);

  return new ApiResponse(
    200,
    {
      upcomingEvents,
      dishCount,
      menuSetCount,
      monthlySpending: monthlySpending._sum.amount || 0,
      subscription: subscription
        ? { status: subscription.status, planName: subscription.plan.name, endDate: subscription.endDate }
        : null,
    },
    'Dashboard fetched successfully'
  ).send(res);
});

module.exports = { getDashboard };
