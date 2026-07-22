export interface PublishedEventResponse {
  id: number;
  title: string;
  description: string | null;
  dateAndTime: string;
  capacity: number;
  venueName: string | null;
  city: string | null;
  country: string | null;
  organizerFirstName: string | null;
  organizerLastName: string | null;
  banner: string | null;
  categoryIds: number[];
  categoryNames: string[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
}
