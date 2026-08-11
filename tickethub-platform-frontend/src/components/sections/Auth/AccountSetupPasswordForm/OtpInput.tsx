import type { KeyboardEvent, RefObject } from "react";

type Props = {
  digits: string[];
  inputRefs: RefObject<(HTMLInputElement | null)[]>;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: KeyboardEvent<HTMLInputElement>) => void;
};

export function OtpInput({ digits, inputRefs, onChange, onKeyDown }: Props) {
  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="number"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => onChange(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          className="w-11 h-12 text-center text-lg font-semibold rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
}
