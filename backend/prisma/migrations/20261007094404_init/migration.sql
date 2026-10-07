-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ABA_PAYWAY', 'VISA_MASTERCARD', 'WING');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PresetSource" AS ENUM ('PRESET', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('PER_TABLE', 'FIXED');

-- CreateTable
CREATE TABLE "chefs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "googleId" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailOtp" TEXT,
    "emailOtpExpiresAt" TIMESTAMP(3),
    "emailOtpResendCount" INTEGER NOT NULL DEFAULT 0,
    "emailOtpResendWindowStart" TIMESTAMP(3),
    "resetOtp" TEXT,
    "resetOtpExpiresAt" TIMESTAMP(3),
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'km',
    "dishViewMode" TEXT NOT NULL DEFAULT 'list',
    "trialUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "conversionRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    "defaultUnitId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chef_units" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "conversionRate" DOUBLE PRECISION NOT NULL,
    "source" "PresetSource" NOT NULL DEFAULT 'CUSTOM',
    "sourcePresetId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chef_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chef_categories" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "source" "PresetSource" NOT NULL DEFAULT 'CUSTOM',
    "sourcePresetId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chef_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chef_ingredients" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "unitId" TEXT NOT NULL,
    "source" "PresetSource" NOT NULL DEFAULT 'CUSTOM',
    "sourcePresetId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chef_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "canceledAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "renewalLockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "planId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "gatewayRef" TEXT,
    "failureReason" TEXT,
    "invoiceNumber" TEXT,
    "refundStatus" "RefundStatus",
    "refundReason" TEXT,
    "refundReviewedBy" TEXT,
    "refundReviewedAt" TIMESTAMP(3),
    "billingNameSnapshot" TEXT,
    "shopAddressSnapshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_info" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "billingName" TEXT,
    "shopAddress" TEXT,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_payment_methods" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "provider" "PaymentMethod" NOT NULL,
    "gatewayToken" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "brand" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dishes" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pricingType" "PricingType" NOT NULL DEFAULT 'PER_TABLE',
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dish_ingredients" (
    "id" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "chefIngredientId" TEXT NOT NULL,
    "quantityUsed" DOUBLE PRECISION NOT NULL,
    "unitId" TEXT,

    CONSTRAINT "dish_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_sets" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_set_dishes" (
    "id" TEXT NOT NULL,
    "menuSetId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "menu_set_dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "tableCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_dishes" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "dishId" TEXT NOT NULL,

    CONSTRAINT "event_dishes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_menu_sets" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "menuSetId" TEXT NOT NULL,

    CONSTRAINT "event_menu_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_presets" (
    "id" TEXT NOT NULL,
    "chefId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_preset_ingredients" (
    "id" TEXT NOT NULL,
    "vendorPresetId" TEXT NOT NULL,
    "chefIngredientId" TEXT NOT NULL,

    CONSTRAINT "vendor_preset_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_purchase_status" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "chefIngredientId" TEXT NOT NULL,
    "isPurchased" BOOLEAN NOT NULL DEFAULT false,
    "purchasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_purchase_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chefs_email_key" ON "chefs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "chefs_googleId_key" ON "chefs"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_chefId_idx" ON "refresh_tokens"("chefId");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

-- CreateIndex
CREATE INDEX "ingredients_categoryId_idx" ON "ingredients"("categoryId");

-- CreateIndex
CREATE INDEX "chef_units_chefId_idx" ON "chef_units"("chefId");

-- CreateIndex
CREATE UNIQUE INDEX "chef_units_chefId_name_key" ON "chef_units"("chefId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "chef_units_chefId_sourcePresetId_key" ON "chef_units"("chefId", "sourcePresetId");

-- CreateIndex
CREATE INDEX "chef_categories_chefId_idx" ON "chef_categories"("chefId");

-- CreateIndex
CREATE INDEX "chef_categories_parentId_idx" ON "chef_categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "chef_categories_chefId_name_key" ON "chef_categories"("chefId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "chef_categories_chefId_sourcePresetId_key" ON "chef_categories"("chefId", "sourcePresetId");

-- CreateIndex
CREATE INDEX "chef_ingredients_chefId_idx" ON "chef_ingredients"("chefId");

-- CreateIndex
CREATE UNIQUE INDEX "chef_ingredients_chefId_name_key" ON "chef_ingredients"("chefId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "chef_ingredients_chefId_sourcePresetId_key" ON "chef_ingredients"("chefId", "sourcePresetId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_chefId_key" ON "subscriptions"("chefId");

-- CreateIndex
CREATE INDEX "subscriptions_status_endDate_idx" ON "subscriptions"("status", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_gatewayRef_key" ON "transactions"("gatewayRef");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_invoiceNumber_key" ON "transactions"("invoiceNumber");

-- CreateIndex
CREATE INDEX "transactions_chefId_idx" ON "transactions"("chefId");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "billing_info_chefId_key" ON "billing_info"("chefId");

-- CreateIndex
CREATE INDEX "saved_payment_methods_chefId_idx" ON "saved_payment_methods"("chefId");

-- CreateIndex
CREATE INDEX "dishes_chefId_idx" ON "dishes"("chefId");

-- CreateIndex
CREATE INDEX "dish_ingredients_dishId_idx" ON "dish_ingredients"("dishId");

-- CreateIndex
CREATE INDEX "dish_ingredients_chefIngredientId_idx" ON "dish_ingredients"("chefIngredientId");

-- CreateIndex
CREATE UNIQUE INDEX "dish_ingredients_dishId_chefIngredientId_key" ON "dish_ingredients"("dishId", "chefIngredientId");

-- CreateIndex
CREATE INDEX "menu_sets_chefId_idx" ON "menu_sets"("chefId");

-- CreateIndex
CREATE INDEX "menu_set_dishes_menuSetId_idx" ON "menu_set_dishes"("menuSetId");

-- CreateIndex
CREATE UNIQUE INDEX "menu_set_dishes_menuSetId_dishId_key" ON "menu_set_dishes"("menuSetId", "dishId");

-- CreateIndex
CREATE INDEX "events_chefId_idx" ON "events"("chefId");

-- CreateIndex
CREATE INDEX "events_eventDate_idx" ON "events"("eventDate");

-- CreateIndex
CREATE INDEX "event_dishes_eventId_idx" ON "event_dishes"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "event_dishes_eventId_dishId_key" ON "event_dishes"("eventId", "dishId");

-- CreateIndex
CREATE INDEX "event_menu_sets_eventId_idx" ON "event_menu_sets"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "event_menu_sets_eventId_menuSetId_key" ON "event_menu_sets"("eventId", "menuSetId");

-- CreateIndex
CREATE INDEX "vendor_presets_chefId_idx" ON "vendor_presets"("chefId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_presets_chefId_name_key" ON "vendor_presets"("chefId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_preset_ingredients_vendorPresetId_chefIngredientId_key" ON "vendor_preset_ingredients"("vendorPresetId", "chefIngredientId");

-- CreateIndex
CREATE INDEX "event_purchase_status_eventId_idx" ON "event_purchase_status"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "event_purchase_status_eventId_chefIngredientId_key" ON "event_purchase_status"("eventId", "chefIngredientId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chef_units" ADD CONSTRAINT "chef_units_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chef_units" ADD CONSTRAINT "chef_units_sourcePresetId_fkey" FOREIGN KEY ("sourcePresetId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chef_categories" ADD CONSTRAINT "chef_categories_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chef_categories" ADD CONSTRAINT "chef_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "chef_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chef_categories" ADD CONSTRAINT "chef_categories_sourcePresetId_fkey" FOREIGN KEY ("sourcePresetId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chef_ingredients" ADD CONSTRAINT "chef_ingredients_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chef_ingredients" ADD CONSTRAINT "chef_ingredients_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "chef_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chef_ingredients" ADD CONSTRAINT "chef_ingredients_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "chef_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chef_ingredients" ADD CONSTRAINT "chef_ingredients_sourcePresetId_fkey" FOREIGN KEY ("sourcePresetId") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_info" ADD CONSTRAINT "billing_info_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_payment_methods" ADD CONSTRAINT "saved_payment_methods_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_chefIngredientId_fkey" FOREIGN KEY ("chefIngredientId") REFERENCES "chef_ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dish_ingredients" ADD CONSTRAINT "dish_ingredients_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "chef_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_sets" ADD CONSTRAINT "menu_sets_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_set_dishes" ADD CONSTRAINT "menu_set_dishes_menuSetId_fkey" FOREIGN KEY ("menuSetId") REFERENCES "menu_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_set_dishes" ADD CONSTRAINT "menu_set_dishes_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_dishes" ADD CONSTRAINT "event_dishes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_dishes" ADD CONSTRAINT "event_dishes_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_menu_sets" ADD CONSTRAINT "event_menu_sets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_menu_sets" ADD CONSTRAINT "event_menu_sets_menuSetId_fkey" FOREIGN KEY ("menuSetId") REFERENCES "menu_sets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_presets" ADD CONSTRAINT "vendor_presets_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "chefs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_preset_ingredients" ADD CONSTRAINT "vendor_preset_ingredients_vendorPresetId_fkey" FOREIGN KEY ("vendorPresetId") REFERENCES "vendor_presets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_preset_ingredients" ADD CONSTRAINT "vendor_preset_ingredients_chefIngredientId_fkey" FOREIGN KEY ("chefIngredientId") REFERENCES "chef_ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_purchase_status" ADD CONSTRAINT "event_purchase_status_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_purchase_status" ADD CONSTRAINT "event_purchase_status_chefIngredientId_fkey" FOREIGN KEY ("chefIngredientId") REFERENCES "chef_ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
