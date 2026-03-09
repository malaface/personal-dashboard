-- CreateEnum
CREATE TYPE "OnchainNetwork" AS ENUM ('ARBITRUM', 'ETHEREUM');

-- CreateEnum
CREATE TYPE "OnchainTxType" AS ENUM ('SWAP', 'LP_ADD', 'LP_REMOVE', 'TRANSFER_IN', 'TRANSFER_OUT', 'APPROVAL', 'BRIDGE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OnchainTxStatus" AS ENUM ('RAW', 'CLASSIFIED', 'FISCAL_PROCESSED', 'MANUALLY_OVERRIDDEN');

-- CreateEnum
CREATE TYPE "FiscalMethod" AS ENUM ('AVERAGE_COST');

-- CreateEnum
CREATE TYPE "OnchainDataSource" AS ENUM ('COVALENT', 'HYPERLIQUID');

-- AlterEnum
ALTER TYPE "AIProvider" ADD VALUE 'COVALENT';

-- CreateTable
CREATE TABLE "onchain_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "network" "OnchainNetwork" NOT NULL DEFAULT 'ARBITRUM',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onchain_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onchain_transactions" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "type" "OnchainTxType" NOT NULL DEFAULT 'UNKNOWN',
    "status" "OnchainTxStatus" NOT NULL DEFAULT 'RAW',
    "dataSource" "OnchainDataSource" NOT NULL,
    "tokenSoldAddress" TEXT,
    "tokenSoldSymbol" TEXT,
    "tokenSoldAmount" DOUBLE PRECISION,
    "tokenSoldPriceUSD" DOUBLE PRECISION,
    "tokenBoughtAddress" TEXT,
    "tokenBoughtSymbol" TEXT,
    "tokenBoughtAmount" DOUBLE PRECISION,
    "tokenBoughtPriceUSD" DOUBLE PRECISION,
    "gasFeeETH" DOUBLE PRECISION,
    "gasFeeUSD" DOUBLE PRECISION,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onchain_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onchain_token_inventory" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgCostBasisUSD" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgCostBasisMXN" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onchain_token_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onchain_fiscal_events" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "method" "FiscalMethod" NOT NULL DEFAULT 'AVERAGE_COST',
    "costBasisUSD" DOUBLE PRECISION NOT NULL,
    "costBasisMXN" DOUBLE PRECISION NOT NULL,
    "proceedsUSD" DOUBLE PRECISION NOT NULL,
    "proceedsMXN" DOUBLE PRECISION NOT NULL,
    "gainLossUSD" DOUBLE PRECISION NOT NULL,
    "gainLossMXN" DOUBLE PRECISION NOT NULL,
    "gasFeeDeduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fiscalPeriod" TEXT NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onchain_fiscal_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "onchain_wallets_userId_isActive_idx" ON "onchain_wallets"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "onchain_wallets_userId_address_network_key" ON "onchain_wallets"("userId", "address", "network");

-- CreateIndex
CREATE INDEX "onchain_transactions_walletId_timestamp_idx" ON "onchain_transactions"("walletId", "timestamp");

-- CreateIndex
CREATE INDEX "onchain_transactions_walletId_type_idx" ON "onchain_transactions"("walletId", "type");

-- CreateIndex
CREATE INDEX "onchain_transactions_txHash_idx" ON "onchain_transactions"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "onchain_transactions_walletId_txHash_key" ON "onchain_transactions"("walletId", "txHash");

-- CreateIndex
CREATE INDEX "onchain_token_inventory_walletId_idx" ON "onchain_token_inventory"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "onchain_token_inventory_walletId_tokenAddress_key" ON "onchain_token_inventory"("walletId", "tokenAddress");

-- CreateIndex
CREATE UNIQUE INDEX "onchain_fiscal_events_transactionId_key" ON "onchain_fiscal_events"("transactionId");

-- CreateIndex
CREATE INDEX "onchain_fiscal_events_fiscalPeriod_idx" ON "onchain_fiscal_events"("fiscalPeriod");

-- AddForeignKey
ALTER TABLE "onchain_wallets" ADD CONSTRAINT "onchain_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onchain_transactions" ADD CONSTRAINT "onchain_transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "onchain_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onchain_token_inventory" ADD CONSTRAINT "onchain_token_inventory_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "onchain_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onchain_fiscal_events" ADD CONSTRAINT "onchain_fiscal_events_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "onchain_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
