/*
  Warnings:

  - Made the column `loginAttempts` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `loginAttempts` INTEGER NOT NULL DEFAULT 0;
