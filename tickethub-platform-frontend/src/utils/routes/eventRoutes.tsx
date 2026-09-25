export const getEventPath = (event: { id: number; slug: string | null }) => {
  return `/events/${event.slug ?? event.id}`;
};
