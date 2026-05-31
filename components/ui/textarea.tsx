import { forwardRef, type TextareaHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id: customId, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;
    const descriptionId = `${textareaId}-description`;
    const hasDescription = !!error || !!helperText;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'min-h-24 rounded-lg border bg-card px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            error ? 'border-danger focus:ring-danger' : 'border-input',
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          {...props}
        />
        {hasDescription && (
          <p
            id={descriptionId}
            className={cn(
              'text-xs',
              error ? 'text-danger' : 'text-muted-foreground'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
