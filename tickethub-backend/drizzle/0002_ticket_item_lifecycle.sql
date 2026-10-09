ALTER TABLE `TicketOrderItems`
  ADD COLUMN `status` varchar(32) NOT NULL DEFAULT 'Valid',
  ADD COLUMN `invalidatedAt` datetime(3) NULL,
  ADD COLUMN `invalidatedBy` int NULL,
  ADD COLUMN `invalidationReason` varchar(500) NULL;

CREATE TABLE IF NOT EXISTS `TicketItemAdjustments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `ticketOrderItemId` int NULL,
  `action` varchar(32) NOT NULL,
  `fromEventTicketId` int NULL,
  `toEventTicketId` int NULL,
  `reason` varchar(500) NULL,
  `actorId` int NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT (now()),
  CONSTRAINT `TicketItemAdjustments_id` PRIMARY KEY(`id`)
);

ALTER TABLE `TicketItemAdjustments`
  ADD CONSTRAINT `TicketItemAdjustments_ticketOrderItemId_TicketOrderItems_id_fk`
    FOREIGN KEY (`ticketOrderItemId`) REFERENCES `TicketOrderItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `TicketItemAdjustments_fromEventTicketId_EventTickets_id_fk`
    FOREIGN KEY (`fromEventTicketId`) REFERENCES `EventTickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `TicketItemAdjustments_toEventTicketId_EventTickets_id_fk`
    FOREIGN KEY (`toEventTicketId`) REFERENCES `EventTickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `TicketItemAdjustments_actorId_Users_id_fk`
    FOREIGN KEY (`actorId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;