import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaginationSect } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Loader2Icon,
  SearchIcon,
  ShieldCheckIcon,
  BanIcon,
} from "lucide-react";
import type {
  GetUsersResponse,
  User,
} from "@/utils/services/admin/users.service";

interface Props {
  data: GetUsersResponse | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (val: string) => void;
  onSuspend: (userId: number, isActive: boolean) => void;
  onVerify: (userId: number) => void;
}

export function OrganizersTable({
  data,
  isLoading,
  page,
  onPageChange,
  search,
  onSearchChange,
  onSuspend,
  onVerify,
}: Props) {
  const [confirm, setConfirm] = useState<{
    type: "suspend" | "verify";
    user: User;
  } | null>(null);

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Loader2Icon className="h-6 w-6 animate-spin" />
      </div>
    );

  const organizers = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-3">
      <div className="relative w-72">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search organizers..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
          }}
        />
      </div>
      <div className="rounded-md border border-border max-h-96 overflow-auto">
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
            {organizers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No organizers found
                </TableCell>
              </TableRow>
            ) : (
              organizers.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">
                    {org.firstName} {org.lastName}
                  </TableCell>
                  <TableCell>{org.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        org.isVerified
                          ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                          : "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      }`}
                      variant={org.isVerified ? "default" : "secondary"}
                    >
                      {org.isVerified ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${
                        org.isVerified
                          ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                          : "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                      }`}
                      variant={org.isActive ? "default" : "destructive"}
                    >
                      {org.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {!org.isVerified && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setConfirm({ type: "verify", user: org })
                        }
                      >
                        <ShieldCheckIcon className="h-3 w-3 mr-1" /> Verify
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={org.isActive ? "destructive" : "default"}
                      onClick={() => setConfirm({ type: "suspend", user: org })}
                    >
                      <BanIcon className="h-3 w-3 mr-1" />{" "}
                      {org.isActive ? "Suspend" : "Reactivate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <PaginationSect
          page={page}
          currentPage={page}
          totalPages={pagination.totalPages}
          setPage={onPageChange}
        />
      )}
      {confirm && (
        <ConfirmDialog
          open
          onOpenChange={(o) => {
            if (!o) setConfirm(null);
          }}
          title={
            confirm.type === "verify"
              ? "Verify Organizer"
              : confirm.user.isActive
              ? "Suspend Organizer"
              : "Reactivate Organizer"
          }
          description={
            confirm.type === "verify"
              ? `Confirm verification for ${confirm.user.firstName} ${confirm.user.lastName}.`
              : confirm.user.isActive
              ? `Are you sure you want to suspend ${confirm.user.firstName} ${confirm.user.lastName}? They will lose access to the platform.`
              : `Reactivate ${confirm.user.firstName} ${confirm.user.lastName}?`
          }
          confirmText={
            confirm.type === "verify"
              ? "Verify"
              : confirm.user.isActive
              ? "Suspend"
              : "Reactivate"
          }
          variant={
            confirm.type === "suspend" && confirm.user.isActive
              ? "destructive"
              : "default"
          }
          onConfirm={() => {
            if (confirm.type === "verify") onVerify(confirm.user.id);
            else onSuspend(confirm.user.id, !confirm.user.isActive);
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}
