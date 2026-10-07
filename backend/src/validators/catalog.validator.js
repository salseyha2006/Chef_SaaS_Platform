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
  parentId: z.string().uuid().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  parentId: z.string().uuid().nullable().optional(),
});

const importIngredientsSchema = z.object({
  items: z
    .array(
      z.object({
        ingredientId: z.string().uuid(),
        purchasePrice: z.number().positive('Price must be greater than 0'),
        unitId: z.string().uuid(),
      })
    )
    .min(1, 'At least one ingredient is required'),
});

const createIngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  purchasePrice: z.number().positive('Price must be greater than 0'),
  unitId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
});

const updateChefIngredientSchema = z.object({
  name: z.string().min(1).optional(),
  purchasePrice: z.number().positive('Price must be greater than 0').optional(),
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
