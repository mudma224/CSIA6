"use client";

import { useId } from "react";

type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type ChoiceGroupProps<T extends string> = {
  name: string;
  legend: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
  hint?: string;
  error?: string;
};

export function ChoiceGroup<T extends string>({
  name, legend, value, options, onChange, hint, error,
}: ChoiceGroupProps<T>) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset
      className="space-y-3"
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy}
    >
      <legend className="text-base font-bold text-forest">{legend}</legend>
      {hint && <p id={hintId} className="text-sm text-muted">{hint}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border bg-white px-4 py-3 text-ink transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-leaf ${value === option.value ? "border-forest bg-mint" : "border-[var(--border)] hover:border-leaf"}`}
          >
            <input
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--leaf)]"
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              aria-describedby={describedBy}
            />
            <span className="min-w-0">
              <span className="block break-words font-semibold">{option.label}</span>
              {option.description && <span className="mt-1 block text-sm text-muted">{option.description}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && <p id={errorId} role="alert" className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
    </fieldset>
  );
}
