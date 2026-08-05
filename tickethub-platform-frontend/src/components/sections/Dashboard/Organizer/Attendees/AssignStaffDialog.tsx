import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2Icon, SearchIcon, Square, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import {
  useAssignEventStaff,
  useEventStaff,
  useOrganizerStaffList,
} from "@/hooks/organizers/useOrganizerStaff";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  onSuccess: () => void;
}

export default function AssignStaffDialog({
  open,
  onOpenChange,
  eventId,
  onSuccess,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const { data: allStaff = [], isLoading: loadingAll } = useOrganizerStaffList(search || undefined);
  const { data: assignedStaff = [] } = useEventStaff(eventId);
  const { mutateAsync: assignStaff, isPending: isAssigning } = useAssignEventStaff();

  const assignedIds = useMemo(
    () => new Set(assignedStaff.map((s) => s.id)),
    [assignedStaff],
  );

  const selectableCount = allStaff.filter((s) => !assignedIds.has(s.id)).length;
  const allSelected = allStaff.every(
    (s) => assignedIds.has(s.id) || selectedIds.has(s.id),
  );

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set<number>();
      for (const s of allStaff) {
        if (!assignedIds.has(s.id)) newSet.add(s.id);
      }
      setSelectedIds(newSet);
    }
  }

  function toggleStaff(id: number) {
    if (assignedIds.has(id)) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  async function handleAssign() {
    if (selectedIds.size === 0) return;
    try {
      await assignStaff({ eventId, staffUserIds: Array.from(selectedIds) });
      toast.success(`${selectedIds.size} staff member(s) assigned`);
      setSelectedIds(new Set());
      setSearch("");
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error("Failed to assign staff");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Staff to Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loadingAll ? (
            <div className="flex items-center justify-center py-8">
              <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : allStaff.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No staff found</p>
          ) : (
            <>
              {selectableCount > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-sm w-full text-left px-1 hover:text-primary transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="font-medium">
                    Select all ({selectableCount} available)
                  </span>
                </button>
              )}
              <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-1">
                {allStaff.map((s) => {
                  const isAssigned = assignedIds.has(s.id);
                  const isSelected = selectedIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isAssigned}
                      onClick={() => toggleStaff(s.id)}
                      className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        isAssigned
                          ? "bg-muted/50 opacity-60 cursor-not-allowed"
                          : isSelected
                            ? "bg-primary/5 hover:bg-primary/10"
                            : "hover:bg-muted"
                      }`}
                    >
                      {isAssigned || isSelected ? (
                        <CheckSquare
                          className={`h-4 w-4 shrink-0 ${
                            isAssigned
                              ? "text-muted-foreground"
                              : "text-primary"
                          }`}
                        />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {s.firstName} {s.lastName}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {s.email}
                        </p>
                      </div>
                      {isAssigned && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                          Assigned
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedIds.size === 0 || isAssigning}
          >
            {isAssigning && (
              <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
            )}
            {isAssigning
              ? "Assigning..."
              : `Assign ${selectedIds.size > 0 ? `${selectedIds.size} staff` : ""}`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
