import 'dotenv/config';
import mysql from 'mysql2/promise';

const database = process.env.DB_NAME;

if (!database) {
  throw new Error('DB_NAME is required.');
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database,
  multipleStatements: false,
});

async function columnExists(tableName: string, columnName: string) {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    `SELECT 1
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1`,
    [database, tableName, columnName],
  );

  return rows.length > 0;
}

async function tableExists(tableName: string) {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    `SELECT 1
       FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
      LIMIT 1`,
    [database, tableName],
  );

  return rows.length > 0;
}

async function constraintExists(tableName: string, constraintName: string) {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    `SELECT 1
       FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ?
      LIMIT 1`,
    [database, tableName, constraintName],
  );

  return rows.length > 0;
}

async function addColumnIfMissing(
  tableName: string,
  columnName: string,
  ddl: string,
) {
  if (await columnExists(tableName, columnName)) {
    console.log(`Column ${tableName}.${columnName} already exists.`);
    return;
  }

  await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${ddl}`);
  console.log(`Added column ${tableName}.${columnName}.`);
}

async function addConstraintIfMissing(
  tableName: string,
  constraintName: string,
  ddl: string,
) {
  if (await constraintExists(tableName, constraintName)) {
    console.log(`Constraint ${constraintName} already exists.`);
    return;
  }

  await connection.query(`ALTER TABLE \`${tableName}\` ADD CONSTRAINT ${ddl}`);
  console.log(`Added constraint ${constraintName}.`);
}

try {
  await addColumnIfMissing(
    'TicketOrderItems',
    'status',
    "`status` varchar(32) NOT NULL DEFAULT 'Valid'",
  );
  await addColumnIfMissing(
    'TicketOrderItems',
    'invalidatedAt',
    '`invalidatedAt` datetime(3) NULL',
  );
  await addColumnIfMissing(
    'TicketOrderItems',
    'invalidatedBy',
    '`invalidatedBy` int NULL',
  );
  await addColumnIfMissing(
    'TicketOrderItems',
    'invalidationReason',
    '`invalidationReason` varchar(500) NULL',
  );

  if (!(await tableExists('TicketItemAdjustments'))) {
    await connection.query(`
      CREATE TABLE \`TicketItemAdjustments\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`ticketOrderItemId\` int NULL,
        \`action\` varchar(32) NOT NULL,
        \`fromEventTicketId\` int NULL,
        \`toEventTicketId\` int NULL,
        \`reason\` varchar(500) NULL,
        \`actorId\` int NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT (now()),
        CONSTRAINT \`TicketItemAdjustments_id\` PRIMARY KEY(\`id\`)
      )
    `);
    console.log('Created table TicketItemAdjustments.');
  } else {
    console.log('Table TicketItemAdjustments already exists.');
  }

  await addConstraintIfMissing(
    'TicketItemAdjustments',
    'TicketItemAdjustments_ticketOrderItemId_TicketOrderItems_id_fk',
    '`TicketItemAdjustments_ticketOrderItemId_TicketOrderItems_id_fk` FOREIGN KEY (`ticketOrderItemId`) REFERENCES `TicketOrderItems`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
  );
  await addConstraintIfMissing(
    'TicketItemAdjustments',
    'TicketItemAdjustments_fromEventTicketId_EventTickets_id_fk',
    '`TicketItemAdjustments_fromEventTicketId_EventTickets_id_fk` FOREIGN KEY (`fromEventTicketId`) REFERENCES `EventTickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
  );
  await addConstraintIfMissing(
    'TicketItemAdjustments',
    'TicketItemAdjustments_toEventTicketId_EventTickets_id_fk',
    '`TicketItemAdjustments_toEventTicketId_EventTickets_id_fk` FOREIGN KEY (`toEventTicketId`) REFERENCES `EventTickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
  );
  await addConstraintIfMissing(
    'TicketItemAdjustments',
    'TicketItemAdjustments_actorId_Users_id_fk',
    '`TicketItemAdjustments_actorId_Users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
  );

  console.log('Ticket lifecycle migration complete.');
} finally {
  await connection.end();
}