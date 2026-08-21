import { useState } from "react";
import { Users, Import } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Contact } from "@/misc/campaignData";
import { ContactCard } from "@/components/ui/contact-card";
import { AudienceBox } from "@/components/ui/audience-box";

type CampaignReciepientProps = {
  contacts: Contact[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
};

export const CampaignReciepient = ({
  contacts,
  selected,
  onSelectedChange,
}: CampaignReciepientProps) => {
  const [audience, setAudience] = useState("all");

  const audienceOptions = [
    { id: "all", label: "All" },
    { id: "event", label: "Event" },
  ];

  const allSelected = selected.length === contacts.length && contacts.length > 0;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    onSelectedChange(checked ? contacts.map((c) => c.id) : []);
  };

  const toggleOne = (id: string, checked: boolean) => {
    onSelectedChange(
      checked ? [...selected, id] : selected.filter((x) => x !== id)
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      {/* Audience selector */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <Users className="size-4 text-muted-foreground" />
          Audience
        </label>
        <div className="flex items-center justify-between gap-6">
          <span className="bg-background p-2 rounded-full border border-border cursor-pointer">
            <Import className="size-6 text-muted-foreground" />
          </span>
          </div>
        </div>
          <AudienceBox />
        <div className="flex flex-wrap gap-2">
          <select name="" id="">
          {audienceOptions.map((opt) => (
            <option value="">

            <button
              key={opt.id}
              onClick={() => setAudience(opt.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                audience === opt.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent"
              )}
              >
              {opt.label}
            </button>
            </option>
          ))}
            </select>
        </div>

        {/* contact list */}
        <div className="mt-5 flex flex-col gap-2">
          {/* select-all header (table header pattern, no <table>) */}
          <div className="flex items-center gap-3 px-2 py-1">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm font-medium text-muted-foreground">
              Select all ({selected.length}/{contacts.length})
            </span>
          </div>

          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              avatar={contact.avatar}
              phoneNumber={contact.phoneNumber}
              checked={selected.includes(contact.id)}
              onCheckedChange={(checked) => toggleOne(contact.id, checked)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
