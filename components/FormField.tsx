import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Label } from '../primitives/label';
import { Input } from '../primitives/input';
import { cn } from '../utils/cx';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor} className="text-sm text-muted-foreground">
        {label}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export interface IconInputProps extends React.ComponentProps<typeof Input> {
  icon: LucideIcon;
  error?: boolean;
}

export function IconInput({ icon: Icon, error, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        className={cn('w-full pl-10', error && 'border-destructive focus-visible:ring-destructive/30', className)}
        {...props}
      />
    </div>
  );
}
