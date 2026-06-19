-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rankScore" INTEGER NOT NULL DEFAULT 0,
    "winCount" INTEGER NOT NULL DEFAULT 0,
    "loseCount" INTEGER NOT NULL DEFAULT 0,
    "drawCount" INTEGER NOT NULL DEFAULT 0,
    "currentWinStreak" INTEGER NOT NULL DEFAULT 0,
    "bestWinStreak" INTEGER NOT NULL DEFAULT 0,
    "battleTickets" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "equippedHatId" TEXT,
    "equippedGlassesId" TEXT,
    "equippedExpressionId" TEXT,
    "equippedOutfitId" TEXT,
    "equippedBackgroundId" TEXT,
    "equippedTitleId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntBeanTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AntBeanTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_period',
    "proposedPeriod" TEXT,
    "proposedBy" TEXT,
    "finalPeriod" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "winnerId" TEXT,
    "loserId" TEXT,
    "isDraw" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleParticipant" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "startPrice" DOUBLE PRECISION,
    "currentPrice" DOUBLE PRECISION,
    "finalPrice" DOUBLE PRECISION,
    "returnRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "antScale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "rewardBeans" INTEGER NOT NULL DEFAULT 0,
    "rankScoreDelta" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BattleParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "previousClose" DOUBLE PRECISION NOT NULL,
    "changeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockPriceHistory" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StockPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "emoji" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AntItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

-- CreateIndex
CREATE INDEX "User_handle_idx" ON "User"("handle");

-- CreateIndex
CREATE INDEX "User_rankScore_idx" ON "User"("rankScore" DESC);

-- CreateIndex
CREATE INDEX "AntBeanTransaction_userId_createdAt_idx" ON "AntBeanTransaction"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AntBeanTransaction_userId_type_idx" ON "AntBeanTransaction"("userId", "type");

-- CreateIndex
CREATE INDEX "AntBeanTransaction_userId_referenceId_type_idx" ON "AntBeanTransaction"("userId", "referenceId", "type");

-- CreateIndex
CREATE INDEX "Friendship_receiverId_status_idx" ON "Friendship"("receiverId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requesterId_receiverId_key" ON "Friendship"("requesterId", "receiverId");

-- CreateIndex
CREATE INDEX "Battle_requesterId_status_idx" ON "Battle"("requesterId", "status");

-- CreateIndex
CREATE INDEX "Battle_opponentId_status_idx" ON "Battle"("opponentId", "status");

-- CreateIndex
CREATE INDEX "Battle_status_endAt_idx" ON "Battle"("status", "endAt");

-- CreateIndex
CREATE INDEX "BattleParticipant_userId_idx" ON "BattleParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleParticipant_battleId_userId_key" ON "BattleParticipant"("battleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_code_key" ON "Stock"("code");

-- CreateIndex
CREATE INDEX "Stock_name_idx" ON "Stock"("name");

-- CreateIndex
CREATE INDEX "StockPriceHistory_stockId_date_idx" ON "StockPriceHistory"("stockId", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "StockPriceHistory_stockId_date_key" ON "StockPriceHistory"("stockId", "date");

-- CreateIndex
CREATE INDEX "PriceSnapshot_battleId_stockId_capturedAt_idx" ON "PriceSnapshot"("battleId", "stockId", "capturedAt");

-- CreateIndex
CREATE INDEX "AntItem_category_idx" ON "AntItem"("category");

-- CreateIndex
CREATE UNIQUE INDEX "UserItem_userId_itemId_key" ON "UserItem"("userId", "itemId");

-- AddForeignKey
ALTER TABLE "AntBeanTransaction" ADD CONSTRAINT "AntBeanTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleParticipant" ADD CONSTRAINT "BattleParticipant_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleParticipant" ADD CONSTRAINT "BattleParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleParticipant" ADD CONSTRAINT "BattleParticipant_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPriceHistory" ADD CONSTRAINT "StockPriceHistory_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AntItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
