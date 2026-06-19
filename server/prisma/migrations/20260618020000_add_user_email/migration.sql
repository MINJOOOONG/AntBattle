-- AlterTable: User 테이블에 email 컬럼 추가 (NOT NULL, UNIQUE)
-- User 테이블에 데이터가 0건이므로 NOT NULL 직접 추가 가능
ALTER TABLE "User" ADD COLUMN "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
