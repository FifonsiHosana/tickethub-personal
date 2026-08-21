import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CustomNumbersInputProps {
  customPhones: string[];
  onAddPhone: (phone: string) => void;
  onRemovePhone: (index: number) => void;
}

export const CustomNumbersInput: React.FC<CustomNumbersInputProps> = ({
  customPhones,
  onAddPhone,
  onRemovePhone,
}) => {
  const MAX_PHONES = 10;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const input = e.currentTarget;
    const value = input.value.trim();
    if (!value || customPhones.length >= MAX_PHONES) return;
    if (!customPhones.includes(value)) {
      onAddPhone(value);
    }
    input.value = '';
  };

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Add phone numbers
        </p>
        <span className="text-xs text-muted-foreground tabular-nums">
          {customPhones.length}/{MAX_PHONES}
        </span>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary">
        <Input
          type="tel"
          inputMode="tel"
          disabled={customPhones.length >= MAX_PHONES}
          onKeyDown={handleKeyDown}
          placeholder="+233XXXXXXXXX"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-50"
        />
        <span className="shrink-0 text-xs text-muted-foreground">press Enter</span>
      </div>

      {customPhones.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {customPhones.map((phone, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="text-foreground tabular-nums">{phone}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-rose-600"
                onClick={() => onRemovePhone(i)}
                aria-label={`Remove ${phone}`}
              >
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};