const { z } = require('zod');

const dishIngredientItemSchema = z.object({
  chefIngredientId: z.string().uuid(),
  quantityUsed: z.number().positive('Quantity used must be greater than 0'),
  unitId: z.string().uuid().optional(),
});

const createDishSchema = z.object({
  name: z.string().min(1, 'Dish name is required'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  pricingType: z.enum(['PER_TABLE', 'FIXED']).optional(),
  ingredients: z.array(dishIngredientItemSchema).min(1, 'At least one ingredient is required'),
});

const updateDishSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  pricingType: z.enum(['PER_TABLE', 'FIXED']).optional(),
  ingredients: z.array(dishIngredientItemSchema).optional(),
  expectedUpdatedAt: z.string().datetime().optional(),
});

module.exports = { createDishSchema, updateDishSchema };
