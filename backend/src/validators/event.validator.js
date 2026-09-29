const { z } = require('zod');

const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  eventDate: z.string().datetime(),
  tableCount: z.number().int().positive(),
});

const updateEventSchema = z.object({
  name: z.string().min(1).optional(),
  eventDate: z.string().datetime().optional(),
  tableCount: z.number().int().positive().optional(),
});

const cloneEventSchema = z.object({
  name: z.string().min(1).optional(),
  eventDate: z.string().datetime().optional(),
});

const addItemsToEventSchema = z.object({
  dishIds: z.array(z.string().uuid()).optional(),
  menuSetIds: z.array(z.string().uuid()).optional(),
});

const vendorPresetSchema = z.object({
  name: z.string().min(1, 'Vendor preset name is required'),
  chefIngredientIds: z.array(z.string().uuid()).min(1),
});

const reportItemOverrideSchema = z.object({
  ingredientName: z.string(),
  totalQuantity: z.number(),
  unit: z.object({ abbreviation: z.string() }),
});

const generatePdfReportSchema = z.object({
  title: z.string().optional(),
  items: z.array(reportItemOverrideSchema).optional(),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  cloneEventSchema,
  addItemsToEventSchema,
  vendorPresetSchema,
  generatePdfReportSchema,
};
