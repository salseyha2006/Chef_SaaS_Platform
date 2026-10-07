const prisma = require('../config/db');
const { convertUnit } = require('../utils/unitConversion');

// US-37 Technical Note: if this recipe line specifies its own unit (different from the
// ChefIngredient's stocked unit), convert quantityUsed into the stocked unit first —
// purchasePrice is always per stocked-unit, so costing must happen in that unit.
function getEffectiveQuantity(dishIngredient) {
  const { quantityUsed, unit: lineUnit, chefIngredient } = dishIngredient;

  if (!lineUnit || lineUnit.id === chefIngredient.unit.id) {
    return quantityUsed;
  }

  return convertUnit(
    { unitType: lineUnit.unitType, conversionRate: lineUnit.conversionRate },
    { unitType: chefIngredient.unit.unitType, conversionRate: chefIngredient.unit.conversionRate },
    quantityUsed
  );
}

// US-42: Recalculate a single Dish's total cost from its current ingredients
async function recalculateDishCost(dishId) {
  const dishIngredients = await prisma.dishIngredient.findMany({
    where: { dishId },
    include: { chefIngredient: { include: { unit: true } }, unit: true },
  });

  const totalCost = dishIngredients.reduce((sum, di) => {
    const effectiveQuantity = getEffectiveQuantity(di);
    return sum + effectiveQuantity * di.chefIngredient.purchasePrice;
  }, 0);

  await prisma.dish.update({ where: { id: dishId }, data: { totalCost } });

  const menuSetLinks = await prisma.menuSetDish.findMany({
    where: { dishId },
    select: { menuSetId: true },
  });
  for (const link of menuSetLinks) {
    await recalculateMenuSetCost(link.menuSetId);
  }

  return totalCost;
}

// US-42: When an ingredient's price (or unit) changes (Epic 8), recalc every Dish using it
async function recalculateDishesUsingChefIngredient(chefIngredientId) {
  const links = await prisma.dishIngredient.findMany({
    where: { chefIngredientId },
    select: { dishId: true },
  });
  const dishIds = [...new Set(links.map((l) => l.dishId))];
  for (const dishId of dishIds) {
    await recalculateDishCost(dishId);
  }
}

// US-46: Recalculate a Menu Set's total cost from its current dishes
async function recalculateMenuSetCost(menuSetId) {
  const menuSetDishes = await prisma.menuSetDish.findMany({
    where: { menuSetId },
    include: { dish: true },
  });

  const totalCost = menuSetDishes.reduce((sum, msd) => sum + msd.dish.totalCost, 0);

  await prisma.menuSet.update({ where: { id: menuSetId }, data: { totalCost } });
  return totalCost;
}

module.exports = {
  recalculateDishCost,
  recalculateDishesUsingChefIngredient,
  recalculateMenuSetCost,
  getEffectiveQuantity,
};
