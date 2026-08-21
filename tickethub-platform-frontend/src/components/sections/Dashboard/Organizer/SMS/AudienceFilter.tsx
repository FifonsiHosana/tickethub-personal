import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EventAudiencePicker } from "./EventAudiencePicker";
import { ContactImport } from "./ContactImport";
import { CustomNumbersInput } from "./CustomNumbersInput";
import { Import, SendIcon, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BsPeople, BsPeopleFill } from "react-icons/bs";

export type AudienceSelection = {
  mode: "event" | "import" | "custom";
  eventId?: number;
  groupIds: number[];
  allGroups: boolean;
  customPhones: string[];
};

type AudienceFilterProps = {
  selection: AudienceSelection;
  onSelectionChange: (selection: AudienceSelection) => void;
};

export const AudienceFilter: React.FC<AudienceFilterProps> = ({
  selection,
  onSelectionChange,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const modes: {
    id: AudienceSelection["mode"];
    label: string;
    icon?: React.ReactNode;
  }[] = [
    { id: "event", label: "Event", icon: <Users className="size-3.5" /> },
    {
      id: "import",
      label: "Import Contacts",
      icon: <Import className="size-3.5" />,
    },
    { id: "custom", label: "Custom", icon: null },
  ];

  const selectMode = (mode: AudienceSelection["mode"]) => {
    if (mode !== "event") {
      onSelectionChange({
        ...selection,
        mode,
        eventId: undefined,
        groupIds: [],
        allGroups: false,
        customPhones: [],
      });
    } else {
      onSelectionChange({
        ...selection,
        mode,
        groupIds: [],
        allGroups: false,
      });
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    const lower = file.name.toLowerCase();
    const ACCEPTED_EXT = [".csv", ".txt", ".xlsx"];
    const MAX_SIZE = 5 * 1024 * 1024;

    if (!ACCEPTED_EXT.some((ext) => lower.endsWith(ext))) {
      setFileError("Unsupported file type. Upload a .csv, .txt or .xlsx file.");
      setFileName(null);
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError("File is too large. Maximum size is 5MB.");
      setFileName(null);
      return;
    }
    setFileError(null);
    setFileName(file.name);
  };

  return (
    <Card className="rounded-xl bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BsPeopleFill className="size-5" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Audience</h3>
          <p className="text-sm text-muted-foreground">
           Select sms receiving contacts.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <Button
            key={m.id}
            type="button"
            variant={selection.mode === m.id ? "default" : "outline"}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              selection.mode === m.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-auto",
            )}
            onClick={() => selectMode(m.id)}
          >
            {m.icon}
            {m.label}
          </Button>
        ))}
      </div>

      {selection.mode === "event" && (
        <EventAudiencePicker
          eventId={selection.eventId}
          groupIds={selection.groupIds}
          allGroups={selection.allGroups}
          onEventChange={(eventId) =>
            onSelectionChange({
              ...selection,
              eventId,
              groupIds: [],
              allGroups: false,
            })
          }
          onGroupChange={(groupIds, allGroups) =>
            onSelectionChange({ ...selection, groupIds, allGroups })
          }
        />
      )}

      {selection.mode === "import" && (
        <ContactImport
          fileName={fileName}
          fileError={fileError}
          onFileSelect={handleFileSelect}
        />
      )}

      {selection.mode === "custom" && (
        <CustomNumbersInput
          customPhones={selection.customPhones}
          onAddPhone={(phone) =>
            onSelectionChange({
              ...selection,
              customPhones: [...selection.customPhones, phone],
            })
          }
          onRemovePhone={(index) =>
            onSelectionChange({
              ...selection,
              customPhones: selection.customPhones.filter(
                (_, idx) => idx !== index,
              ),
            })
          }
        />
      )}
    </Card>
  );
};
