const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { buildShoppingList, getAllDishesInEvent } = require('../services/shoppingList.service');
const { createPdfDocument, writePurchasingListPdf } = require('../services/pdf.service');

async function resolveReportItems(eventId, overrideItems) {
  if (overrideItems && overrideItems.length > 0) {
    return overrideItems;
  }
  const result = await buildShoppingList(eventId);
  return result.items;
}

// US-58: Generate Custom PDF Purchasing Report (A4) — name + quantity ONLY (business secret: hide price)
const generatePdfReport = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { eventId } = req.params;
  const { items: overrideItems, title } = req.body;

  const [event, chef] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.chef.findUnique({ where: { id: chefId }, select: { language: true } }),
  ]);
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  const items = await resolveReportItems(eventId, overrideItems);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=purchasing-list-${eventId}.pdf`);

  const doc = createPdfDocument();
  doc.pipe(res);
  writePurchasingListPdf(doc, { title, event, items, language: chef.language });
  doc.end();
});

// US-59: Export Cost Report to Excel — FULL detail (dish, ingredient, quantity, unit price, total)
const exportExcelReport = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  const result = await buildShoppingList(eventId);
  const { dishes } = await getAllDishesInEvent(eventId);

  const workbook = new ExcelJS.Workbook();

  const detailSheet = workbook.addWorksheet('Dish Detail');
  detailSheet.columns = [
    { header: 'Dish', key: 'dish', width: 25 },
    { header: 'Ingredient', key: 'ingredient', width: 25 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Unit', key: 'unit', width: 10 },
    { header: 'Unit Price', key: 'unitPrice', width: 12 },
    { header: 'Subtotal', key: 'subtotal', width: 12 },
  ];

  for (const dish of dishes) {
    for (const di of dish.ingredients) {
      detailSheet.addRow({
        dish: dish.name,
        ingredient: di.chefIngredient.name,
        quantity: di.quantityUsed * event.tableCount,
        unit: di.chefIngredient.unit.abbreviation,
        unitPrice: di.chefIngredient.purchasePrice,
        subtotal: Number((di.quantityUsed * event.tableCount * di.chefIngredient.purchasePrice).toFixed(2)),
      });
    }
  }

  const summarySheet = workbook.addWorksheet('Shopping List Summary');
  summarySheet.columns = [
    { header: 'Ingredient', key: 'ingredient', width: 25 },
    { header: 'Total Quantity', key: 'totalQuantity', width: 15 },
    { header: 'Unit', key: 'unit', width: 10 },
    { header: 'Unit Price', key: 'unitPrice', width: 12 },
    { header: 'Total Price', key: 'totalPrice', width: 14 },
  ];
  for (const item of result.items) {
    summarySheet.addRow({
      ingredient: item.ingredientName,
      totalQuantity: item.totalQuantity,
      unit: item.unit.abbreviation,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    });
  }
  summarySheet.addRow({});
  summarySheet.addRow({ ingredient: 'Grand Total', totalPrice: result.grandTotal });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=cost-report-${eventId}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
});

module.exports = { generatePdfReport, exportExcelReport };