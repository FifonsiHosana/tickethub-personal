import React, { useState } from "react";
import {
  ChevronDown,
  Loader2,
  Phone,
  Search,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganizerEvents } from "@/hooks/organizers/useOrganizerEvents";
import {
  useEventTickets,
  useTicketHoldersPhoneNumbers,
} from "@/hooks/organizers/useOrganizerSms";
// import type { TicketResponse } from "@/hooks/organizers/useOrganizerSms";

interface EventAudiencePickerProps {
  eventId?: number;
  groupIds: number[];
  allGroups: boolean;
  onEventChange: (eventId: number | undefined) => void;
  onGroupChange: (groupIds: number[], allGroups: boolean) => void;
}

const PhoneList: React.FC<{ phones: string[] }> = ({ phones }) => {
  const [showPhones, setShowPhones] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filteredPhones = phones.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPhones((prev) => !prev)}
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <span>{showPhones ? "Hide phone list" : "View phone list"}</span>
        <ChevronDown
          className={cn(
            "size-3 transition-transform",
            showPhones && "rotate-180",
          )}
        />
      </Button>

      {showPhones && (
        <div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-border bg-card p-2">
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary">
            <Search className="size-4 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phones…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          <ul className="space-y-1">
            {filteredPhones.map((phone, i) => (
              <li key={i} className="text-xs font-mono text-muted-foreground">
                {phone}
              </li>
            ))}
            {filteredPhones.length === 0 && search && (
              <li className="text-xs text-muted-foreground">No matches</li>
            )}
            {filteredPhones.length > 10 && !expanded && (
              <Button
                variant="ghost"
                size="xs"
                className="w-full mt-1"
                onClick={() => setExpanded(true)}
              >
                Show all {filteredPhones.length} numbers
              </Button>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export const EventAudiencePicker: React.FC<EventAudiencePickerProps> = ({
  eventId,
  groupIds,
  allGroups,
  onEventChange,
  onGroupChange,
}) => {
  const [eventOpen, setEventOpen] = useState(false);
  // const [search, setSearch] = useState("");

  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useOrganizerEvents();
  console.log(eventsData);

  const eventsList = Array.isArray(eventsData?.data) ? eventsData?.data : [];

  const { data: groups = [], isLoading: groupsLoading } = useEventTickets(
    eventId ?? null,
  );
  // const { data: phoneNumbers = [], isLoading: phonesLoading } =
  //   useTicketHoldersPhoneNumbers(eventId ?? null, allGroups ? [] : groupIds);

  const activeEvent = eventsList.find((e) => e.id === eventId);

  const toggleGroup = (id: number, checked: boolean) => {
    const next = checked ? [...groupIds, id] : groupIds.filter((x) => x !== id);
    onGroupChange(next, false);
  };

  const toggleAllGroups = (checked: boolean) => {
    onGroupChange(
      checked ? groups.map((g) => g.ticketTypeId ?? g.id) : [],
      checked,
    );
  };

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
        onClick={() => setEventOpen((o) => !o)}
      >
        <span>{activeEvent ? activeEvent.title : "Select an event"}</span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            eventOpen && "rotate-180",
          )}
        />
      </Button>

      {eventOpen && (
        <ul className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border shadow-sm">
          {eventsLoading ? (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading events…
            </li>
          ) : eventsError ? (
            <li className="px-4 py-3 text-sm text-rose-500 flex items-center gap-2">
              <AlertTriangle className="size-4" />
              Failed to fetch events
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => refetchEvents}
                className="ml-2"
              >
                <ChevronDown className="size-3 animate-spin" />
              </Button>
            </li>
          ) : eventsList.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No events found.
            </li>
          ) : (
            eventsList.map((evt) => (
              <li key={evt.id}>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-auto justify-start",
                    eventId === evt.id
                      ? "font-medium text-primary bg-primary/5"
                      : "text-foreground",
                  )}
                  onClick={() => {
                    onEventChange(evt.id);
                    setEventOpen(false);
                  }}
                >
                  {evt.title}
                </Button>
              </li>
            ))
          )}
        </ul>
      )}

      {activeEvent && (
        <div className="mt-4 space-y-4">
          {/* <div className="rounded-xl border border-border bg-accent/20 p-3">
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

            {phoneNumbers.length > 0 && <PhoneList phones={phoneNumbers} />}
          </div> */}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Targeting Groups (ticket types)
            </p>

            {groupsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading ticket
                types…
              </div>
            ) : groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No ticket groups found.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-auto cursor-pointer">
                  <Checkbox
                    checked={allGroups}
                    onCheckedChange={toggleAllGroups}
                  />
                  <span className="text-sm font-medium text-foreground">
                    All ticket types
                  </span>
                </label>

                {groups.map((g) => {
                  const groupId = g.ticketTypeId ?? g.id;
                  const isChecked = allGroups || groupIds.includes(groupId);

                  return (
                    <div
                      key={groupId}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-auto"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <Checkbox
                          checked={isChecked}
                          disabled={allGroups}
                          onCheckedChange={(checked) =>
                            toggleGroup(groupId, checked as boolean)
                          }
                        />
                        <span className="text-sm text-foreground">
                          {g.name}
                        </span>
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
  );
};
