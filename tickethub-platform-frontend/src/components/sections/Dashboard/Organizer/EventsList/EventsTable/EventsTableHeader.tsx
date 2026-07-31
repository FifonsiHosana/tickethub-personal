import { Link } from "react-router";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ExportDropdown } from "@/components/shared/ExportDropdown";
import type { OrganizerEventResponse } from "@/utils/services/organizers/events.service";

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  events: OrganizerEventResponse[] | undefined;
}

export function EventsTableHeader({ search, onSearchChange, events }: Props) {
  return (
    <CardHeader className="px-6 py-4 border-b border-gray-300">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between items-start justify-start">
        <div>
          <CardTitle className="text-lg">All Events</CardTitle>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-56">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-sm bg-white"
            />
          </div>
          <div className="space-x-1">
            <ExportDropdown
              data={(events ?? []) as unknown as Record<string, unknown>[]}
              columns={[
                { key: "title", label: "Event Name" },
                { key: "dateAndTime", label: "Date & Time" },
                { key: "capacity", label: "Capacity" },
                { key: "status", label: "Status" },
                { key: "approvalStatus", label: "Approval" },
              ]}
              filename="events"
              title="All Events"
            />
            <Button className="h-8 px-3" size="sm">
              <Link to="/organizer/events/new" className="flex items-center">
                <PlusIcon className="mr-2 h-4 w-4" /> New
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
