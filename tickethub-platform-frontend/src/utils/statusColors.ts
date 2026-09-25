export const statusColor: Record<string, string> = {
  Published:
    "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm shadow-sm",
  Draft:
    "bg-slate-950/80 text-slate-200 border border-slate-500/40 backdrop-blur-sm shadow-sm",
  Completed:
    "bg-blue-950/80 text-blue-300 border border-blue-500/40 backdrop-blur-sm shadow-sm",
  Cancelled:
    "bg-red-950/80 text-red-300 border border-red-500/40 backdrop-blur-sm shadow-sm",
};

export const approvalColor: Record<string, string> = {
  Approved:
    "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20",
  Pending:
    "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20",
  Rejected:
    "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20",
};
