import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "../ui/button";

type Props = {
  page: number;
  setPage: (page: number) => void;
  currentPage: number;
  totalPages: number;
};

export const PaginationSect = ({
  page,
  setPage,
  currentPage,
  totalPages,
}: Props) => {
  return (
    totalPages > 1 && (
      <div className="flex items-center justify-between mt-12 px-1">
        <p className="text-xs md:text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(Math.max(1, page - 1))}
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
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(page + 1)}
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
    )
  );
};
