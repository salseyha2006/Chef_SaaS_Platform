const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { recalculateMenuSetCost } = require('../services/costing.service');

async function assertDishesOwnedByChef(chefId, dishIds) {
  const validCount = await prisma.dish.count({ where: { id: { in: dishIds }, chefId } });
  if (validCount !== dishIds.length) {
    throw ApiError.badRequest('One or more dishes do not belong to you or do not exist', [], { code: 'MENU_SET_DISHES_INVALID' });
  }
}

// US-45: Create Menu Set
const createMenuSet = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { name, dishIds } = req.body;

  await assertDishesOwnedByChef(chefId, dishIds);

  const menuSet = await prisma.menuSet.create({ data: { chefId, name } });

  await prisma.menuSetDish.createMany({
    data: dishIds.map((dishId, index) => ({ menuSetId: menuSet.id, dishId, sortOrder: index })),
  });

  await recalculateMenuSetCost(menuSet.id);

  const fullMenuSet = await prisma.menuSet.findUnique({ where: { id: menuSet.id } });
  return new ApiResponse(201, fullMenuSet, 'Menu set created successfully').send(res);
});

// List Menu Sets
const getMenuSets = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { archived } = req.query;

  const menuSets = await prisma.menuSet.findMany({
    where: { chefId, isArchived: archived === 'true' },
    orderBy: { name: 'asc' },
  });

  return new ApiResponse(200, menuSets, 'Menu sets fetched successfully').send(res);
});

// US-46: View Menu Set Detail with dishes + total cost
const getMenuSetDetail = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const menuSet = await prisma.menuSet.findUnique({
    where: { id },
    include: {
      dishes: {
        orderBy: { sortOrder: 'asc' },
        include: { dish: true },
      },
    },
  });

  if (!menuSet || menuSet.chefId !== chefId) throw ApiError.notFound('Menu set not found', { code: 'MENU_SET_NOT_FOUND' });

  return new ApiResponse(
    200,
    {
      id: menuSet.id,
      name: menuSet.name,
      totalCost: menuSet.totalCost,
      isArchived: menuSet.isArchived,
      dishes: menuSet.dishes.map((msd) => ({
        dishId: msd.dish.id,
        name: msd.dish.name,
        imageUrl: msd.dish.imageUrl,
        cost: msd.dish.totalCost,
        sortOrder: msd.sortOrder,
      })),
    },
    'Menu set detail fetched successfully'
  ).send(res);
});

// US-47: Customize Existing Menu Set (replace full dish list, preserving order)
const updateMenuSet = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { name, dishIds } = req.body;

  const menuSet = await prisma.menuSet.findUnique({ where: { id } });
  if (!menuSet || menuSet.chefId !== chefId) throw ApiError.notFound('Menu set not found', { code: 'MENU_SET_NOT_FOUND' });

  if (dishIds) {
    await assertDishesOwnedByChef(chefId, dishIds);
    await prisma.menuSetDish.deleteMany({ where: { menuSetId: id } });
    await prisma.menuSetDish.createMany({
      data: dishIds.map((dishId, index) => ({ menuSetId: id, dishId, sortOrder: index })),
    });
  }

  if (name) {
    await prisma.menuSet.update({ where: { id }, data: { name } });
  }

  await recalculateMenuSetCost(id);

  const updated = await prisma.menuSet.findUnique({ where: { id } });
  return new ApiResponse(200, updated, 'Menu set updated successfully').send(res);
});

const archiveMenuSet = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const menuSet = await prisma.menuSet.findUnique({ where: { id } });
  if (!menuSet || menuSet.chefId !== chefId) throw ApiError.notFound('Menu set not found', { code: 'MENU_SET_NOT_FOUND' });

  const updated = await prisma.menuSet.update({ where: { id }, data: { isArchived: true } });
  return new ApiResponse(200, updated, 'Menu set archived successfully').send(res);
});

const deleteMenuSet = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const menuSet = await prisma.menuSet.findUnique({ where: { id } });
  if (!menuSet || menuSet.chefId !== chefId) throw ApiError.notFound('Menu set not found', { code: 'MENU_SET_NOT_FOUND' });

  await prisma.menuSet.delete({ where: { id } });

  return new ApiResponse(200, null, 'Menu set deleted successfully').send(res);
});

module.exports = {
  createMenuSet,
  getMenuSets,
  getMenuSetDetail,
  updateMenuSet,
  archiveMenuSet,
  deleteMenuSet,
};
