const { z } = require('zod');

const createUnitSchema = z.object({
  name: z.string().min(1, 'Unit name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required'),
  unitType: z.enum(['weight', 'volume', 'count']),
  conversionRate: z.number().positive('Conversion rate is required and must be > 0'),
});

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

const importIngredientsSchema = z.object({
  items: z
    .array(
      z.object({
        ingredientId: z.string().uuid(),
        purchasePrice: z.number().nonnegative(),
        unitId: z.string().uuid(),
      })
    )
    .min(1, 'At least one ingredient is required'),
});

const updateChefIngredientSchema = z.object({
  purchasePrice: z.number().nonnegative(),
  unitId: z.string().uuid(),
});

module.exports = {
  createUnitSchema,
  createCategorySchema,
  importIngredientsSchema,
  updateChefIngredientSchema,
};
