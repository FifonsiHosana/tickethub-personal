type Media = {
  id: number;
  eventId: number;
  imageUrl: string;
  type: string;
};

interface EventBannerProps {
  media: Media[];
  title: string;
}

export function EventBanner({ media, title }: EventBannerProps) {
  const banner = media?.find((m: Media) => m.type === "Banner")?.imageUrl;

  if (!banner) {
    return (
      <div className="w-full h-32 bg-muted flex items-center justify-center">
        <span className="text-sm text-muted-foreground">No Banner</span>
      </div>
    );
  }

  return (
    <div className="w-full aspect-square bg-muted relative">
      <img src={banner} alt={title} className="w-full h-full object-center" />
    </div>
  );
}
