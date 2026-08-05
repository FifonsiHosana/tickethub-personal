import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";

type Props = {
  page: number;
  setPage: (page: number) => void;
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  onPageSizeChange?: (value: number) => void;
  pageSizeOptions?: number[];
};

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 25, 50];

export const PaginationSect = ({
  page,
  setPage,
  currentPage,
  totalPages,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: Props) => {
  const showPageSize = !!onPageSizeChange && !!pageSize;

  const handlePageChange = (next: number) => {
    if (totalPages > 0) {
      setPage(Math.min(Math.max(1, next), totalPages));
    }
  };

  return (
    <div className="flex items-center justify-center mt-12 px-1 gap-2 flex-wrap">
      {showPageSize ? (
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm text-muted-foreground">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              onPageSizeChange?.(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-17.5 h-8 text-xs">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <p className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
          Page {currentPage} of {totalPages}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className={
                  page <= 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <Button
                  variant={p === currentPage ? "outline" : "ghost"}
                  size="icon"
                  className="h-8 w-8 text-sm"
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </Button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                className={
                  page >= totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
