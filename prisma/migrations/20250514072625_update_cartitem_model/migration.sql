/*
  Warnings:

  - You are about to drop the column `image` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `CartItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[notificationsId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cartId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "image",
DROP COLUMN "name",
DROP COLUMN "price";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cartId" TEXT,
ADD COLUMN     "notificationsId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_notificationsId_key" ON "User"("notificationsId");

-- CreateIndex
CREATE UNIQUE INDEX "User_cartId_key" ON "User"("cartId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
