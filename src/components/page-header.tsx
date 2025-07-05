import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from './ui/sidebar';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn('sticky top-0 z-10 flex h-auto items-start gap-4 border-b bg-background/80 backdrop-blur-sm px-4 py-3 sm:px-6', className)} {...props}>
      <SidebarTrigger className="md:hidden mt-1" />
      <div className="flex-1">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 break-words">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
