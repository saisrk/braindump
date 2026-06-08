import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'relative border border-border bg-card text-card-foreground rounded-xl',
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        elevated: 'shadow-md',
        interactive: 'shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5',
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
      <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card, cardVariants };
