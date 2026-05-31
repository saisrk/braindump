import { forwardRef, type InputHTMLAttributes, useId } from 'react';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Helper text displayed below the input when there is no error */
  helperText?: string;
  /** Additional class names for the input element */
  className?: string;
  /** Custom id for the input (auto-generated if not provided) */
  id?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id: customId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const descriptionId = `${inputId}-description`;
    const hasDescription = !!error || !!helperText;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary dark:text-text-dark-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-md border px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary bg-surface dark:bg-surface-dark dark:text-text-dark-primary dark:placeholder:text-text-dark-secondary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-300 dark:border-slate-700'
          } ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          {...props}
        />
        {hasDescription && (
          <p
            id={descriptionId}
            className={`text-xs ${
              error
                ? 'text-red-500'
                : 'text-text-secondary dark:text-text-dark-secondary'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
