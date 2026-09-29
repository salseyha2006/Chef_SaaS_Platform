const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const units = [
  { name: 'Kilogram', abbreviation: 'kg', unitType: 'weight', conversionRate: 1000 },
  { name: 'Gram', abbreviation: 'g', unitType: 'weight', conversionRate: 1 },
  { name: 'Liter', abbreviation: 'L', unitType: 'volume', conversionRate: 1000 },
  { name: 'Milliliter', abbreviation: 'ml', unitType: 'volume', conversionRate: 1 },
  { name: 'Tablespoon', abbreviation: 'tbsp', unitType: 'volume', conversionRate: 15 },
  { name: 'Teaspoon', abbreviation: 'tsp', unitType: 'volume', conversionRate: 5 },
  { name: 'Cup', abbreviation: 'cup', unitType: 'volume', conversionRate: 250 },
  { name: 'Piece', abbreviation: 'pc', unitType: 'count', conversionRate: 1 },
  { name: 'Pack', abbreviation: 'pack', unitType: 'count', conversionRate: 1 },
  { name: 'Clove', abbreviation: 'clove', unitType: 'count', conversionRate: 1 },
];

const categories = [
  'Meat',
  'Seafood',
  'Vegetable',
  'Fruit',
  'Spice & Herb',
  'Sauce & Condiment',
  'Dairy & Egg',
  'Grain & Noodle',
];

const ingredients = [
  { name: 'Pork Belly', category: 'Meat', unit: 'Kilogram' },
  { name: 'Chicken Breast', category: 'Meat', unit: 'Kilogram' },
  { name: 'Beef Shank', category: 'Meat', unit: 'Kilogram' },
  { name: 'Shrimp', category: 'Seafood', unit: 'Kilogram' },
  { name: 'Squid', category: 'Seafood', unit: 'Kilogram' },
  { name: 'Fish Sauce', category: 'Sauce & Condiment', unit: 'Liter' },
  { name: 'Soy Sauce', category: 'Sauce & Condiment', unit: 'Liter' },
  { name: 'Oyster Sauce', category: 'Sauce & Condiment', unit: 'Liter' },
  { name: 'Garlic', category: 'Spice & Herb', unit: 'Clove' },
  { name: 'Lemongrass', category: 'Spice & Herb', unit: 'Piece' },
  { name: 'Chili', category: 'Spice & Herb', unit: 'Gram' },
  { name: 'Egg', category: 'Dairy & Egg', unit: 'Piece' },
  { name: 'Coconut Milk', category: 'Dairy & Egg', unit: 'Liter' },
  { name: 'Jasmine Rice', category: 'Grain & Noodle', unit: 'Kilogram' },
  { name: 'Rice Noodle', category: 'Grain & Noodle', unit: 'Kilogram' },
  { name: 'Cucumber', category: 'Vegetable', unit: 'Kilogram' },
  { name: 'Cabbage', category: 'Vegetable', unit: 'Kilogram' },
  { name: 'Lime', category: 'Fruit', unit: 'Piece' },
];

async function main() {
  console.log('🌱 Seeding units...');
  const unitMap = {};
  for (const u of units) {
    const created = await prisma.unit.upsert({
      where: { name: u.name },
      update: {
        abbreviation: u.abbreviation,
        unitType: u.unitType,
        conversionRate: u.conversionRate,
      },
      create: u,
    });
    unitMap[u.name] = created.id;
  }

  console.log('🌱 Seeding categories...');
  const categoryMap = {};
  for (const name of categories) {
    const created = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryMap[name] = created.id;
  }

  console.log('🌱 Seeding ingredients...');
  for (const ing of ingredients) {
    await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {
        categoryId: categoryMap[ing.category],
        defaultUnitId: unitMap[ing.unit],
      },
      create: {
        name: ing.name,
        categoryId: categoryMap[ing.category],
        defaultUnitId: unitMap[ing.unit],
      },
    });
  }

  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
