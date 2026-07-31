import { AlignLeft } from "lucide-react";

interface EventAboutProps {
  description?: string;
  termsAndConditions?: string;
}

export function EventAbout({
  description,
  termsAndConditions,
}: EventAboutProps) {
  if (!description && !termsAndConditions) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlignLeft className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-base">About Event</h3>
      </div>

      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      )}

      {termsAndConditions && (
        <div className="pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Terms & Conditions
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-md border border-muted/50 whitespace-pre-wrap">
            {termsAndConditions}
          </p>
        </div>
      )}
    </div>
  );
}
