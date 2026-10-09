-- Run this before 0001_checkout_v2_intents.sql on live databases that were
-- created before the current Drizzle schema. It only adds missing columns.
ALTER TABLE `TicketOrders`
  ADD COLUMN IF NOT EXISTS `status` ENUM('Pending', 'Completed') NOT NULL DEFAULT 'Pending' AFTER `userId`,
  ADD COLUMN IF NOT EXISTS `quantity` int NOT NULL DEFAULT 0 AFTER `status`,
  ADD COLUMN IF NOT EXISTS `reference` varchar(255) NULL AFTER `quantity`;
