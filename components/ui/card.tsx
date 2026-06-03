import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'relative border border-border bg-card backdrop-filter backdrop-blur-sm text-card-foreground rounded-none',
  {
    variants: {
      variant: {
        default: 'hud-frame',
        elevated: 'hud-frame shadow-lg shadow-primary/10',
        interactive:
          'hud-frame transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20',
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
