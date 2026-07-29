import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";
import type { User } from "@/utils/services/admin/users.service";

interface Props {
  organizers: User[];
  isLoading: boolean;
  onVerify: (userId: number) => void;
}

export function VerificationQueueTable({ organizers, isLoading, onVerify }: Props) {
  if (isLoading) return <div className="flex justify-center py-8"><Loader2Icon className="h-6 w-6 animate-spin" /></div>;

  if (organizers.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <ShieldCheckIcon className="h-10 w-10 text-neutral-300 mb-3" />
        <p className="text-muted-foreground text-sm">All organizers have been verified.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border max-h-120 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizers.map((org) => (
            <TableRow key={org.id}>
              <TableCell className="font-medium">{org.firstName} {org.lastName}</TableCell>
              <TableCell>{org.email}</TableCell>
              <TableCell>{org.phoneNumber ?? "—"}</TableCell>
              <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" onClick={() => onVerify(org.id)}>
                  <ShieldCheckIcon className="h-3 w-3 mr-1" /> Verify
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
