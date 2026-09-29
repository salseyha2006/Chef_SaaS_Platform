const { z } = require('zod');

const createUnitSchema = z.object({
  name: z.string().min(1, 'Unit name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required'),
  unitType: z.enum(['weight', 'volume', 'count']),
  conversionRate: z.number().positive('Conversion rate is required and must be > 0'),
});

const updateUnitSchema = z.object({
  name: z.string().min(1).optional(),
  abbreviation: z.string().min(1).optional(),
  unitType: z.enum(['weight', 'volume', 'count']).optional(),
  conversionRate: z.number().positive().optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
});

const importIngredientsSchema = z.object({
  items: z
    .array(
      z.object({
        ingredientId: z.string().uuid(), // global preset id
        purchasePrice: z.number().nonnegative(),
        unitId: z.string().uuid(), // this chef's own ChefUnit id
      })
    )
    .min(1, 'At least one ingredient is required'),
});

// US-11 Scenario 2: brand-new custom ingredient, not copied from any preset
const createIngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  purchasePrice: z.number().nonnegative(),
  unitId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
});

const updateChefIngredientSchema = z.object({
  name: z.string().min(1).optional(),
  purchasePrice: z.number().nonnegative().optional(),
  unitId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});

module.exports = {
  createUnitSchema,
  updateUnitSchema,
  createCategorySchema,
  updateCategorySchema,
  importIngredientsSchema,
  createIngredientSchema,
  updateChefIngredientSchema,
};