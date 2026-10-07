/**
 * US-27 Technical Note: convert a quantity between two Units that share the same
 * unitType, using each Unit's `conversionRate` relative to the base unit of its type
 * (base = the unit whose conversionRate is 1, e.g. Gram for weight, Milliliter for
 * volume, Piece for count — see prisma/seed.js).
 */

class UnitConversionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnitConversionError';
  }
}

/**
 * @param {{ unitType: string, conversionRate: number }} fromUnit
 * @param {{ unitType: string, conversionRate: number }} toUnit
 * @param {number} quantity
 * @returns {number} quantity expressed in `toUnit`
 */
function convertUnit(fromUnit, toUnit, quantity) {
  if (!fromUnit || !toUnit) {
    throw new UnitConversionError('Both fromUnit and toUnit are required');
  }
  if (fromUnit.unitType !== toUnit.unitType) {
    throw new UnitConversionError(
      `Cannot convert between different unit types: "${fromUnit.unitType}" and "${toUnit.unitType}"`
    );
  }
  if (!(fromUnit.conversionRate > 0) || !(toUnit.conversionRate > 0)) {
    throw new UnitConversionError('conversionRate must be a positive number on both units');
  }
  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    throw new UnitConversionError('quantity must be a number');
  }

  const quantityInBaseUnit = quantity * fromUnit.conversionRate;
  return quantityInBaseUnit / toUnit.conversionRate;
}

function convertUnitRounded(fromUnit, toUnit, quantity, decimals = 3) {
  const result = convertUnit(fromUnit, toUnit, quantity);
  return Number(result.toFixed(decimals));
}

module.exports = { convertUnit, convertUnitRounded, UnitConversionError };

// ── Self-contained tests — run directly with `node src/utils/unitConversion.js` ──
if (require.main === module) {
  const assert = require('assert');

  const Gram = { unitType: 'weight', conversionRate: 1 };
  const Kilogram = { unitType: 'weight', conversionRate: 1000 };
  const Milliliter = { unitType: 'volume', conversionRate: 1 };
  const Liter = { unitType: 'volume', conversionRate: 1000 };
  const Tablespoon = { unitType: 'volume', conversionRate: 15 };
  const Piece = { unitType: 'count', conversionRate: 1 };

  assert.strictEqual(convertUnit(Kilogram, Gram, 2), 2000);
  assert.strictEqual(convertUnit(Gram, Kilogram, 500), 0.5);
  assert.strictEqual(convertUnit(Kilogram, Kilogram, 7), 7);
  assert.strictEqual(convertUnit(Tablespoon, Milliliter, 3), 45);
  assert.strictEqual(convertUnit(Liter, Milliliter, 1.5), 1500);
  assert.strictEqual(convertUnit(Piece, Piece, 12), 12);
  assert.strictEqual(convertUnitRounded(Gram, Kilogram, 100, 3), 0.1);
  assert.throws(() => convertUnit(Kilogram, Liter, 1), /Cannot convert between different unit types/);
  assert.throws(
    () => convertUnit({ unitType: 'weight', conversionRate: 0 }, Gram, 1),
    /conversionRate must be a positive number/
  );
  assert.throws(() => convertUnit(Gram, Kilogram, 'abc'), /quantity must be a number/);

  console.log('✅ All unitConversion tests passed');
}
