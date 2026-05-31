import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl border border-border bg-card text-card-foreground',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-sm',
        interactive:
          'transition-all hover:border-brand-300 hover:shadow-sm dark:hover:border-brand-700',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card, cardVariants };
