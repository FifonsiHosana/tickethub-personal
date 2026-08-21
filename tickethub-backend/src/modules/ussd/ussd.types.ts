export type TelcoProviders = "mtn" | "vod" | "atl";

export interface EventDetails {
  id: number;
  name: string;
  time: string;
  location: string;
  description: string | null;
  ticketTypes: { id: number; name: string; price: number; remaining: number; totalCount:number; eventTicketId: number }[];
}

export type Category = { id: number; name: string };

export type CategoryEvent = { id: number; name: string };

export type sessionContext = {
  sessionId: string;
  phoneNumber: string;
  data: Record<string, any>;
  telcoProvider: TelcoProviders;
  eventDetails: EventDetails | undefined;
};

export type MenuNode = {
  id: string;
  prompt(context: sessionContext): Promise<string> | string;
  data?: string;
  resolve?: (
    input: string,
    context: sessionContext,
  ) => string | Promise<string | undefined> | undefined;
  options?: Record<string, string>;
  next?: string;
  isTerminal?: boolean;
  onSelect?: Record<string, (context: sessionContext) => Promise<void>>;
  action?: boolean;
  paginate?: {
    moreOption: string;
    seeLess: string;
  };
};