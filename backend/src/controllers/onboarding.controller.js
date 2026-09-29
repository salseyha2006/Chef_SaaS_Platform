const prisma = require('../config/db');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// US-10: Mark First-Time Onboarding Wizard as completed
const completeOnboarding = asyncHandler(async (req, res) => {
  const chef = await prisma.chef.update({
    where: { id: req.chef.id },
    data: { hasCompletedOnboarding: true },
  });

  return new ApiResponse(
    200,
    { hasCompletedOnboarding: chef.hasCompletedOnboarding },
    'Onboarding marked as completed'
  ).send(res);
});

module.exports = { completeOnboarding };
