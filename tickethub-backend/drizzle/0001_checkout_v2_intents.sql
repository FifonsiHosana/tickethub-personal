CREATE TABLE IF NOT EXISTS `TicketOrderIntents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NULL,
  `eventTicketId` int NULL,
  `quantity` int NOT NULL,
  `unitPrice` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `TicketOrderIntents_orderId_idx` (`orderId`),
  KEY `TicketOrderIntents_eventTicketId_idx` (`eventTicketId`),
  CONSTRAINT `TicketOrderIntents_orderId_TicketOrders_id_fk`
    FOREIGN KEY (`orderId`) REFERENCES `TicketOrders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TicketOrderIntents_eventTicketId_EventTickets_id_fk`
    FOREIGN KEY (`eventTicketId`) REFERENCES `EventTickets` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
);
