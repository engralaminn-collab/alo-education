import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ALOButton({
  children,
  className,
  variant = 'primary',
  size = 'default',
  ...props
}) {
  const baseStyles = 'border-l-4 border-education-blue transition-all hover:shadow-lg';

  const variants = {
    primary: `${baseStyles} bg-alo-orange hover:bg-orange-600 text-white font-semibold`,
    secondary: `${baseStyles} bg-education-blue hover:bg-blue-700 text-white font-semibold`,
    outline: `${baseStyles} border border-alo-orange text-alo-orange hover:bg-orange-50`,
    ghost: `${baseStyles} text-alo-orange hover:bg-orange-50`
  };

  return (
    <Button
      className={cn(variants[variant], className)}
      size={size}
      {...props}
    >
      {children}
    </Button>
  );
}