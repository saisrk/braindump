import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

const cardVariants = cva(
  'rounded-lg border p-6 bg-surface-secondary text-text-primary dark:bg-surface-dark-secondary dark:text-text-dark-primary dark:border-slate-700',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-md',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Additional class names for composition */
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card, cardVariants };
