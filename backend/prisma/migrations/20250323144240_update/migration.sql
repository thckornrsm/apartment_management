/*
  Warnings:

  - Added the required column `electricityFee` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waterFee` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "electricityFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "waterFee" DOUBLE PRECISION NOT NULL;
