-- AlterTable
ALTER TABLE `user` ADD COLUMN `isLocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lockDuration` DATETIME(3) NULL,
    ADD COLUMN `loginAttempts` VARCHAR(191) NULL;
