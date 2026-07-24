import { DownloadIcon, FileTextIcon, TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";

interface Column {
  key: string;
  label: string;
}

interface ExportDropdownProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column[];
  filename: string;
  title: string;
}

export function ExportDropdown<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  title,
}: ExportDropdownProps<T>) {
  const rows = data.map((row) =>
    columns.map((col) => String(row[col.key] ?? "")),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <DownloadIcon className="h-3.5 w-3.5" />
            Export
          </Button>
        }
      />
      <DropdownMenuContent className="bg-white space-y-2" align="end">
        <DropdownMenuItem
          className="gap-2 cursor-pointer "
          onClick={() =>
            exportToCsv(
              data as Record<string, unknown>[],
              filename,
              Object.fromEntries(columns.map((c) => [c.key, c.label])),
            )
          }
        >
          <TableIcon className="h-4 w-4" />{" "}
          <span className="text-xs">Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onClick={() =>
            exportToPdf(
              title,
              columns.map((c) => c.label),
              rows,
            )
          }
        >
          <FileTextIcon className="h-4 w-4" />{" "}
          <span className="text-xs">Export as PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
