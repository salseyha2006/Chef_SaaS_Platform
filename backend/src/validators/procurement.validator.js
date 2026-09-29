const { z } = require('zod');

const togglePurchasedSchema = z.object({
  isPurchased: z.boolean(),
});

module.exports = { togglePurchasedSchema };
