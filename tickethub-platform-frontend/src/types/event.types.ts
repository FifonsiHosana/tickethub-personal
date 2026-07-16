export interface EventVenue {
  id: number;
  venue_name: string;
  address?: string;
  city_or_town: string;
  country: string;
  googleMapLink?: string;
}

export interface EventImage {
  id: number;
  imageUrl: string;
  type: "Banner" | "Gallery" | "Sponsor";
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  dateAndTime: string;
  capacity: number;
  venueName: string;
  city: string;
  country: string;
  organizerFirstName: string;
  organizerLastName: string;
  termsAndConditions?: string;
  banner: string;
  images: EventImage[];
}

