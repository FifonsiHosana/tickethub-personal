import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_STEPS = ["Event Details", "Venue", "Tickets", "Publish"];

interface EventStepsProps {
  /** Zero-based index of the active step */
  currentStep?: number;
  /** Called when a step is clicked (e.g. scroll to that section) */
  onStepClick?: (index: number) => void;
  steps?: string[];
}

export const EventSteps: React.FC<EventStepsProps> = ({
  currentStep = 0,
  onStepClick,
  steps = DEFAULT_STEPS,
}) => {
  const currentTitle = steps[currentStep] || "";
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <nav
      aria-label="Event steps"
      className="sticky top-0 z-40 border-b border-border bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="block sm:hidden">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>
              <span className="font-bold text-foreground">{currentTitle}</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            {steps.map((title, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <button
                  key={title}
                  type="button"
                  onClick={() => onStepClick?.(index)}
                  aria-label={`Go to step ${index + 1}: ${title}`}
                  className="p-1 focus:outline-none"
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                      isActive &&
                        "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                      isCompleted && "bg-primary/80 text-primary-foreground",
                      !isActive &&
                        !isCompleted &&
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {isCompleted ? <Check className="size-3.5" /> : index + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <ol className="hidden items-center sm:flex">
          {steps.map((title, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isReached = isActive || isCompleted;
            const isLast = index === steps.length - 1;
            return (
              <React.Fragment key={title}>
                <li className="flex-1">
                  <button
                    type="button"
                    onClick={() => onStepClick?.(index)}
                    aria-current={isActive ? "step" : undefined}
                    className="group flex w-full items-center gap-3 transition-opacity hover:opacity-80"
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full font-bold transition-colors",
                        isReached
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isCompleted ? <Check className="size-5" /> : index + 1}
                    </span>
                    <span className="flex flex-col text-left">
                      <span
                        className={cn(
                          "text-xs font-medium uppercase tracking-wide transition-colors",
                          isReached ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        Step {index + 1}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-bold transition-colors whitespace-nowrap",
                          isReached ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {title}
                      </span>
                    </span>
                  </button>
                </li>
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className="mx-4 h-1 flex-1 overflow-hidden rounded-full bg-muted sm:mx-6"
                  >
                    <div
                      className={cn(
                        "h-full bg-primary transition-all duration-300",
                        isCompleted ? "w-full" : "w-0",
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default EventSteps;
