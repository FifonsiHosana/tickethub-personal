// import { Link } from "react-router";
// import { PlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ExportDropdown } from "@/components/shared/ExportDropdown";
import type { AttendeeResponse } from "@/utils/services/organizers/attendees.service";
import { SearchIcon } from "lucide-react";
// import type { OrganizerEventResponse } from "@/utils/services/organizers/events.service";

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  //   events: OrganizerEventResponse[] | undefined;
  attendees: AttendeeResponse[] | undefined;
}

export function AttendeesTableHeader({
  search,
  onSearchChange,
  attendees,
}: Props) {
  return (
    <CardHeader className="px-6 py-4  border-border">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between items-start justify-start">
        <div>
          <CardTitle className="text-lg">All Attendees</CardTitle>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-56">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-sm bg-card"
            />
          </div>
          <div className="space-x-1">
            <ExportDropdown
              data={(attendees ?? []) as unknown as Record<string, unknown>[]}
              columns={[
                { key: "firstName", label: "First Name" },
                { key: "lastName", label: "Last Name" },
                { key: "email", label: "Email" },
                { key: "phoneNumber", label: "Phone Number" },
                { key: "ticketType", label: "Ticket Type" },
                { key: "checkedInAt", label: "Checked In At" },
                { key: "price", label: "Price" },
              ]}
              filename="events"
              title="All Events"
            />
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
