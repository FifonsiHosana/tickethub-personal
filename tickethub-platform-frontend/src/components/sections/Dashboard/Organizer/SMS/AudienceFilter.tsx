import React, { useEffect, useState } from "react";
import {
  Users,
  Import,
  ChevronDown,
  UploadCloud,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Phone,
  X,
} from "lucide-react";
import type { OrganizerEventResponse } from "@/utils/services/organizers/events.service";
import { getOrganizerEvents } from "@/utils/services/organizers/events.service";
import {
  getEventTickets,
  getTicketHoldersPhoneNumbers,
  type TicketResponse,
} from "@/utils/services/organizers/tickets.service";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type AudienceSelection = {
  mode: "all" | "event" | "import" | "custom";
  eventId?: number;
  groupIds: number[];
  allGroups: boolean;
  customPhones: string[];
};

type AudienceFilterProps = {
  selection: AudienceSelection;
  onSelectionChange: (selection: AudienceSelection) => void;
};

const ACCEPTED_EXT = [".csv", ".txt", ".xlsx"];
const MAX_SIZE = 5 * 1024 * 1024;

export const AudienceFilter: React.FC<AudienceFilterProps> = ({
  selection,
  onSelectionChange,
}) => {
  const [eventOpen, setEventOpen] = useState(false);

  // Events state
  const [eventsList, setEventsList] = useState<OrganizerEventResponse[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Ticket Tiers state
  const [groups, setGroups] = useState<TicketResponse[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Attendee phone numbers state directly from backend
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [phonesLoading, setPhonesLoading] = useState(false);
  const [showPhones, setShowPhones] = useState(false);

  // File import state
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // 1. Fetch Organizer Events on mount
  useEffect(() => {
    let active = true;
    async function loadOrganizerEvents() {
      try {
        setEventsLoading(true);
        setEventsError(null);
        const response = await getOrganizerEvents();
        if (active) {
          setEventsList(response.data || []);
        }
      } catch (err) {
        if (active) {
          setEventsError("Failed to fetch events");
          console.error(err);
        }
      } finally {
        if (active) setEventsLoading(false);
      }
    }
    loadOrganizerEvents();
    return () => {
      active = false;
    };
  }, []);

  // 2. Fetch Tickets and Attendee Phone Numbers when Event selection changes
  useEffect(() => {
    if (selection.mode !== "event" || selection.eventId === undefined) {
      return;
    }
    let active = true;

    async function loadEventData(eventId: number) {
      setGroupsLoading(true);
      setPhonesLoading(true);
      try {
        const [ticketsData, phonesData] = await Promise.all([
          getEventTickets(eventId),
          getTicketHoldersPhoneNumbers(eventId),
        ]);

        if (active) {
          setGroups(ticketsData);
          setPhoneNumbers(phonesData);
        }
      } catch (err) {
        console.error("Failed to fetch event audience data:", err);
      } finally {
        if (active) {
          setGroupsLoading(false);
          setPhonesLoading(false);
        }
      }
    }

    loadEventData(selection.eventId);
    return () => {
      active = false;
    };
  }, [selection.mode, selection.eventId]);

  const activeEvent = eventsList.find((e) => e.id === selection.eventId);

  const modes: { id: AudienceSelection["mode"]; label: string }[] = [
    { id: "event", label: "Event" },
    { id: "import", label: "Import Contacts" },
    { id: "custom", label: "Custom" },
  ];

  const selectMode = (mode: AudienceSelection["mode"]) => {
    if (mode !== "event") {
      setGroups([]);
      setPhoneNumbers([]);
    }
    onSelectionChange({
      mode,
      eventId: mode === "event" ? selection.eventId : undefined,
      groupIds: [],
      allGroups: false,
      customPhones: [],
    });
  };

  const toggleGroup = (id: number, checked: boolean) => {
    const next = checked
      ? [...selection.groupIds, id]
      : selection.groupIds.filter((x) => x !== id);
    onSelectionChange({ ...selection, groupIds: next, allGroups: false });
  };

  const toggleAllGroups = (checked: boolean) => {
    onSelectionChange({
      ...selection,
      allGroups: checked,
      groupIds: checked ? groups.map((g) => g.ticketTypeId ?? g.id) : [],
    });
  };

  const validateFile = (file: File) => {
    const lower = file.name.toLowerCase();
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
    <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
        <Users className="size-4 text-muted-foreground" />
        Audience
      </div>

      {/* Mode selectors */}
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => selectMode(m.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              selection.mode === m.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent"
            )}
          >
            {m.id === "import" && <Import className="size-3.5" />}
            {m.label}
          </button>
        ))}
      </div>

      {/* Event Selection */}
      {selection.mode === "event" && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setEventOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
          >
            <span>{activeEvent ? activeEvent.title : "Select an event"}</span>
            <ChevronDown
              className={cn("size-4 transition-transform", eventOpen && "rotate-180")}
            />
          </button>

          {eventOpen && (
            <ul className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-white shadow-sm">
              {eventsLoading ? (
                <li className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading events…
                </li>
              ) : eventsError ? (
                <li className="px-4 py-3 text-sm text-rose-500">{eventsError}</li>
              ) : eventsList.length === 0 ? (
                <li className="px-4 py-3 text-sm text-muted-foreground">No events found.</li>
              ) : (
                eventsList.map((evt) => (
                  <li key={evt.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectionChange({
                          ...selection,
                          eventId: evt.id,
                          groupIds: [],
                          allGroups: false,
                        });
                        setEventOpen(false);
                      }}
                      className={cn(
                        "block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent",
                        selection.eventId === evt.id
                          ? "font-medium text-primary bg-primary/5"
                          : "text-foreground"
                      )}
                    >
                      {evt.title}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}

          {/* Ticket Tiers & Direct Phone Summary */}
          {activeEvent && (
            <div className="mt-4 space-y-4">
              {/* Unique Contacts Overview from getAttendeePhoneNumbersByEvent */}
              <div className="rounded-xl border border-border bg-accent/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Phone className="size-4 text-primary" />
                    <span>Unique Event Audience</span>
                  </div>
                  {phonesLoading ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {phoneNumbers.length} recipients
                    </span>
                  )}
                </div>

                {phoneNumbers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPhones((prev) => !prev)}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <span>{showPhones ? "Hide phone list" : "View phone list"}</span>
                    <ChevronDown
                      className={cn("size-3 transition-transform", showPhones && "rotate-180")}
                    />
                  </button>
                )}

                {showPhones && (
                  <div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-border bg-white p-2">
                    <ul className="space-y-1">
                      {phoneNumbers.map((phone, i) => (
                        <li key={i} className="text-xs font-mono text-muted-foreground">
                          {phone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Target Tiers selection */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Targeting Groups (ticket types)
                </p>

                {groupsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Loading ticket types…
                  </div>
                ) : groups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No ticket groups found.</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent cursor-pointer">
                      <Checkbox
                        checked={selection.allGroups}
                        onCheckedChange={toggleAllGroups}
                      />
                      <span className="text-sm font-medium text-foreground">All ticket types</span>
                    </label>

                    {groups.map((g) => {
                      const groupId = g.ticketTypeId ?? g.id;
                      const isChecked =
                        selection.allGroups || selection.groupIds.includes(groupId);

                      return (
                        <div
                          key={groupId}
                          className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-accent"
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <Checkbox
                              checked={isChecked}
                              disabled={selection.allGroups}
                              onCheckedChange={(checked) =>
                                toggleGroup(groupId, checked as boolean)
                              }
                            />
                            <span className="text-sm text-foreground">{g.name}</span>
                          </label>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {g.totalSold} sold
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import mode */}
      {selection.mode === "import" && (
        <div className="mt-4">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) validateFile(file);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-border bg-accent/30 hover:bg-accent/50"
            )}
          >
            <UploadCloud className={cn("size-7", dragActive ? "text-primary" : "text-muted-foreground")} />
            <p className="text-sm text-foreground">Drag & drop a contact file here</p>
            <p className="text-xs text-muted-foreground">or click to browse *.csv, .txt, .xlsx (max 5MB)</p>
            <input
              type="file"
              accept=".csv,.txt,.xlsx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) validateFile(file);
              }}
            />
          </label>

          {fileError && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {fileName && !fileError && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Loaded: {fileName}</span>
            </div>
          )}
        </div>
      )}

      {/* Custom mode */}
      {selection.mode === "custom" && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Add phone numbers
            </p>
            <span className="text-xs text-muted-foreground tabular-nums">
              {selection.customPhones.length}/10
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary">
            <input
              type="tel"
              inputMode="tel"
              disabled={selection.customPhones.length >= 10}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const input = e.currentTarget;
                const value = input.value.trim();
                if (!value || selection.customPhones.length >= 10) return;
                if (!selection.customPhones.includes(value)) {
                  onSelectionChange({
                    ...selection,
                    customPhones: [...selection.customPhones, value],
                  });
                }
                input.value = "";
              }}
              placeholder="+233XXXXXXXXX"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-50"
            />
            <span className="shrink-0 text-xs text-muted-foreground">press Enter</span>
          </div>

          {selection.customPhones.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {selection.customPhones.map((phone, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="text-foreground tabular-nums">{phone}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onSelectionChange({
                        ...selection,
                        customPhones: selection.customPhones.filter((_, idx) => idx !== i),
                      })
                    }
                    className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-rose-600"
                    aria-label={`Remove ${phone}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};