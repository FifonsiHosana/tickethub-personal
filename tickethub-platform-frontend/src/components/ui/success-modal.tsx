import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type SuccessModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  message: string;
};

export function SuccessModal({ show, onClose, title = "Success!", message }: SuccessModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
            <Check className="size-8 text-green-600" />
          </div>

          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>

          <Button className="mt-2 w-full rounded-xl" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
