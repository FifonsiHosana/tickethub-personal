import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2Icon, SearchIcon, ShieldCheckIcon, BanIcon } from "lucide-react";
import type { User } from "@/utils/services/admin/users.service";

interface Props {
  organizers: User[];
  isLoading: boolean;
  onSuspend: (userId: number, isActive: boolean) => void;
  onVerify: (userId: number) => void;
}

export function OrganizersTable({ organizers, isLoading, onSuspend, onVerify }: Props) {
  const [search, setSearch] = useState("");
  const filtered = organizers.filter(
    (o) =>
      o.firstName.toLowerCase().includes(search.toLowerCase()) ||
      o.lastName.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) return <div className="flex justify-center py-8"><Loader2Icon className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="relative w-72">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search organizers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="rounded-md border max-h-120 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No organizers found</TableCell></TableRow>
            ) : (
              filtered.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.firstName} {org.lastName}</TableCell>
                  <TableCell>{org.email}</TableCell>
                  <TableCell><Badge variant={org.isVerified ? "default" : "secondary"}>{org.isVerified ? "Yes" : "No"}</Badge></TableCell>
                  <TableCell><Badge variant={org.isActive ? "default" : "destructive"}>{org.isActive ? "Active" : "Suspended"}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    {!org.isVerified && (
                      <Button size="sm" variant="outline" onClick={() => onVerify(org.id)}>
                        <ShieldCheckIcon className="h-3 w-3 mr-1" /> Verify
                      </Button>
                    )}
                    <Button size="sm" variant={org.isActive ? "destructive" : "default"} onClick={() => onSuspend(org.id, !org.isActive)}>
                      <BanIcon className="h-3 w-3 mr-1" /> {org.isActive ? "Suspend" : "Reactivate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
