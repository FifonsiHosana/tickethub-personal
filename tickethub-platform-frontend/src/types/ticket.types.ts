export interface TicketConfiguration {
  id: number;
  price: string;
  totalCount: number;
  totalSold: number;
  totalRemaining: number;
  salesStartDate: string;
  salesEndDate: string;
  benefits?: string;
}

export interface EventTicket {
  eventTicketId: number;
  ticketId: number;
  ticketName: string;
  ticketType: string;
  description: string | null;
  price: string;
  totalRemaining: number;
  salesStart: string;
  salesEnd: string;
  benefits: string | null;
}
