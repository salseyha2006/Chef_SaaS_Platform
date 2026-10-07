const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { buildShoppingList } = require('../services/shoppingList.service');

const createEvent = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { name, eventDate, tableCount } = req.body;

  const event = await prisma.event.create({
    data: { chefId, name, eventDate: new Date(eventDate), tableCount },
  });

  return new ApiResponse(201, event, 'Event created successfully').send(res);
});

const getEvents = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { upcoming } = req.query;

  const events = await prisma.event.findMany({
    where: {
      chefId,
      eventDate: upcoming === 'true' ? { gte: new Date() } : undefined,
    },
    orderBy: { eventDate: 'asc' },
  });

  return new ApiResponse(200, events, 'Events fetched successfully').send(res);
});

const getEventDetail = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      dishes: { include: { dish: true } },
      menuSets: { include: { menuSet: true } },
    },
  });

  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  return new ApiResponse(200, event, 'Event detail fetched successfully').send(res);
});

const updateEvent = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { name, eventDate, tableCount } = req.body;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  const updated = await prisma.event.update({
    where: { id },
    data: { name, eventDate: eventDate ? new Date(eventDate) : undefined, tableCount },
  });

  return new ApiResponse(200, updated, 'Event updated successfully').send(res);
});

const cloneEvent = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { name, eventDate } = req.body;

  const original = await prisma.event.findUnique({
    where: { id },
    include: { dishes: true, menuSets: true },
  });
  if (!original || original.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  const clone = await prisma.event.create({
    data: {
      chefId,
      name: name || `${original.name} (Copy)`,
      eventDate: eventDate ? new Date(eventDate) : original.eventDate,
      tableCount: original.tableCount,
    },
  });

  if (original.dishes.length > 0) {
    await prisma.eventDish.createMany({
      data: original.dishes.map((d) => ({ eventId: clone.id, dishId: d.dishId })),
    });
  }
  if (original.menuSets.length > 0) {
    await prisma.eventMenuSet.createMany({
      data: original.menuSets.map((m) => ({ eventId: clone.id, menuSetId: m.menuSetId })),
    });
  }

  return new ApiResponse(201, clone, 'Event cloned successfully').send(res);
});

const addItemsToEvent = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { dishIds = [], menuSetIds = [] } = req.body;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  if (dishIds.length > 0) {
    const validDishCount = await prisma.dish.count({ where: { id: { in: dishIds }, chefId } });
    if (validDishCount !== dishIds.length) throw ApiError.badRequest('One or more dishes are invalid', [], { code: 'EVENT_DISHES_INVALID' });

    await prisma.eventDish.createMany({
      data: dishIds.map((dishId) => ({ eventId: id, dishId })),
      skipDuplicates: true,
    });
  }

  if (menuSetIds.length > 0) {
    const validMenuSetCount = await prisma.menuSet.count({ where: { id: { in: menuSetIds }, chefId } });
    if (validMenuSetCount !== menuSetIds.length) throw ApiError.badRequest('One or more menu sets are invalid', [], { code: 'EVENT_MENU_SETS_INVALID' });

    await prisma.eventMenuSet.createMany({
      data: menuSetIds.map((menuSetId) => ({ eventId: id, menuSetId })),
      skipDuplicates: true,
    });
  }

  const updated = await prisma.event.findUnique({
    where: { id },
    include: { dishes: { include: { dish: true } }, menuSets: { include: { menuSet: true } } },
  });

  return new ApiResponse(200, updated, 'Items added to event successfully').send(res);
});

const removeDishFromEvent = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id, dishId } = req.params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  await prisma.eventDish.deleteMany({ where: { eventId: id, dishId } });
  return new ApiResponse(200, null, 'Dish removed from event').send(res);
});

const removeMenuSetFromEvent = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id, menuSetId } = req.params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  await prisma.eventMenuSet.deleteMany({ where: { eventId: id, menuSetId } });
  return new ApiResponse(200, null, 'Menu set removed from event').send(res);
});

const getEventCostCalculation = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  const result = await buildShoppingList(id);

  return new ApiResponse(
    200,
    {
      eventId: id,
      eventName: result.event.name,
      tableCount: result.event.tableCount,
      items: result.items,
      grandTotal: result.grandTotal,
    },
    'Event cost calculation fetched successfully'
  ).send(res);
});

module.exports = {
  createEvent,
  getEvents,
  getEventDetail,
  updateEvent,
  cloneEvent,
  addItemsToEvent,
  removeDishFromEvent,
  removeMenuSetFromEvent,
  getEventCostCalculation,
};
