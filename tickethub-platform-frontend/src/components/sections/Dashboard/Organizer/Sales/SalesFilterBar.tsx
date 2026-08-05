import { SearchIcon, FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Status = "Completed" | "Failed" | "All" | null;

interface SalesFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  status: Status;
  setStatus: (val: Status) => void;
}

export const SalesFilterBar = ({
  search,
  setSearch,
  status,
  setStatus,
}: SalesFilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="relative w-full sm:w-96">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 w-full"
        />
      </div>

      <div className="w-full sm:w-48">
        <Select value={status} onValueChange={(val: Status) => setStatus(val)}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Transactions</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
