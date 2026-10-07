const prisma = require('../config/db');

// Collect every Dish involved in an Event (direct dishes + dishes inside added Menu Sets)
async function getAllDishesInEvent(eventId) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      dishes: {
        include: {
          dish: { include: { ingredients: { include: { chefIngredient: { include: { unit: true } } } } } },
        },
      },
      menuSets: {
        include: {
          menuSet: {
            include: {
              dishes: {
                include: {
                  dish: {
                    include: { ingredients: { include: { chefIngredient: { include: { unit: true } } } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!event) return null;

  const dishes = [
    ...event.dishes.map((ed) => ed.dish),
    ...event.menuSets.flatMap((ems) => ems.menuSet.dishes.map((msd) => msd.dish)),
  ];

  return { event, dishes };
}

// US-53: Build the aggregated shopping list, grouped by this chef's own ingredient, scaled by tableCount
async function buildShoppingList(eventId) {
  const result = await getAllDishesInEvent(eventId);
  if (!result) return null;
  const { event, dishes } = result;

  const grouped = {}; // key: ChefIngredient.id

  for (const dish of dishes) {
    for (const di of dish.ingredients) {
      const chefIngredient = di.chefIngredient;
      const unit = chefIngredient.unit;
      const key = chefIngredient.id;

      if (!grouped[key]) {
        grouped[key] = {
          chefIngredientId: chefIngredient.id,
          ingredientName: chefIngredient.name,
          unit: { id: unit.id, name: unit.name, abbreviation: unit.abbreviation },
          unitPrice: chefIngredient.purchasePrice,
          quantityPerTable: 0,
        };
      }
      grouped[key].quantityPerTable += di.quantityUsed;
    }
  }

  const items = Object.values(grouped).map((item) => {
    const totalQuantity = item.quantityPerTable * event.tableCount;
    return {
      ...item,
      totalQuantity,
      totalPrice: Number((totalQuantity * item.unitPrice).toFixed(2)),
    };
  });

  const grandTotal = Number(items.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2));

  return { event, items, grandTotal };
}

// US-60: Merge each item's purchased checkbox state into the aggregated shopping list
async function buildShoppingListWithPurchaseStatus(eventId) {
  const result = await buildShoppingList(eventId);
  if (!result) return null;

  const statuses = await prisma.eventPurchaseStatus.findMany({ where: { eventId } });
  const statusMap = new Map(statuses.map((s) => [s.chefIngredientId, s.isPurchased]));

  const items = result.items.map((item) => ({
    ...item,
    isPurchased: statusMap.get(item.chefIngredientId) || false,
  }));

  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const progress = items.length > 0 ? Number(((purchasedCount / items.length) * 100).toFixed(1)) : 0;

  return { ...result, items, purchasedCount, totalCount: items.length, progress };
}

module.exports = { getAllDishesInEvent, buildShoppingList, buildShoppingListWithPurchaseStatus };
