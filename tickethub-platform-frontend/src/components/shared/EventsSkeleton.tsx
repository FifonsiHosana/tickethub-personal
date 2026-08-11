import { Skeleton } from "../ui/skeleton";

type Props = {
  pageSize: number;
};
export const EventsSkeleton = ({ pageSize }: Props) => {
  return (
    <>
      <section className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-62.5 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
