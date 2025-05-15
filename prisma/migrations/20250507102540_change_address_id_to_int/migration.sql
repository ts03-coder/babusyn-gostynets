/*
  Warnings:

  - The `addressId` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "postal" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "addressId",
ADD COLUMN     "addressId" INTEGER;
