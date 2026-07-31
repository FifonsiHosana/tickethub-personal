import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationSect } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Loader2Icon, SearchIcon, ShieldCheckIcon } from "lucide-react";
import type { GetUsersResponse, User } from "@/utils/services/admin/users.service";

interface Props {
  data: GetUsersResponse | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (val: string) => void;
  onVerify: (userId: number) => void;
}

export function VerificationQueueTable({ data, isLoading, page, onPageChange, search, onSearchChange, onVerify }: Props) {
  const [confirmUser, setConfirmUser] = useState<User | null>(null);

  const organizers = data?.data ?? [];
  const pagination = data?.pagination;

  if (isLoading) return <div className="flex justify-center py-8"><Loader2Icon className="h-6 w-6 animate-spin" /></div>;

  if (!search && organizers.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <ShieldCheckIcon className="h-10 w-10 text-neutral-300 mb-3" />
        <p className="text-muted-foreground text-sm">All organizers have been verified.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-72">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search verification queue..." className="pl-9" value={search} onChange={(e) => { onSearchChange(e.target.value); }} />
      </div>
      <div className="rounded-md border max-h-96 overflow-auto">
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
            {organizers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No matches found</TableCell></TableRow>
            ) : (
              organizers.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.firstName} {org.lastName}</TableCell>
                  <TableCell>{org.email}</TableCell>
                  <TableCell>{org.phoneNumber ?? "—"}</TableCell>
                  <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => setConfirmUser(org)}>
                      <ShieldCheckIcon className="h-3 w-3 mr-1" /> Verify
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <PaginationSect page={page} currentPage={page} totalPages={pagination.totalPages} setPage={onPageChange} />
      )}
      <ConfirmDialog
        open={confirmUser !== null}
        onOpenChange={(o) => { if (!o) setConfirmUser(null); }}
        title="Verify Organizer"
        description={confirmUser ? `Confirm verification for ${confirmUser.firstName} ${confirmUser.lastName}?` : ""}
        confirmText="Verify"
        onConfirm={() => {
          if (confirmUser) { onVerify(confirmUser.id); setConfirmUser(null); }
        }}
      />
    </div>
  );
}
