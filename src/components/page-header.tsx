import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from './ui/sidebar';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn('sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6', className)} {...props}>
      <SidebarTrigger className="md:hidden" />
      <h1 className="flex-1 text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
