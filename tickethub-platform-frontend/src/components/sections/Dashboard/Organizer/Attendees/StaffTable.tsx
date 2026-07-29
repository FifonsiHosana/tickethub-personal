import type { StaffMember } from "@/utils/services/organizers/staff.service";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Props {
  data: StaffMember[];
  isLoading: boolean;
}

export default function StaffTable({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading staff...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No staff assigned yet. Generate an invite link to add staff.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Assigned</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell className="font-medium">
                {staff.firstName} {staff.lastName}
              </TableCell>
              <TableCell>{staff.email}</TableCell>
              <TableCell>{staff.phoneNumber ?? "—"}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {new Date(staff.assignedAt).toLocaleDateString()}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
