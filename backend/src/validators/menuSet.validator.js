const { z } = require('zod');

const createMenuSetSchema = z.object({
  name: z.string().min(1, 'Menu set name is required'),
  dishIds: z.array(z.string().uuid()).min(1, 'At least one dish is required'),
});

const updateMenuSetSchema = z.object({
  name: z.string().min(1).optional(),
  dishIds: z.array(z.string().uuid()).optional(),
});

module.exports = { createMenuSetSchema, updateMenuSetSchema };
