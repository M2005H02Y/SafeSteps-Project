import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, BookCheck, FileText, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { title: 'Workstations', count: 2, icon: <Building2 className="h-6 w-6 text-muted-foreground" />, href: '/workstations' },
    { title: 'Standards', count: 2, icon: <BookCheck className="h-6 w-6 text-muted-foreground" />, href: '/standards' },
    { title: 'Forms', count: 3, icon: <FileText className="h-6 w-6 text-muted-foreground" />, href: '/forms' },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Dashboard" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">Total active items</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href={stat.href}>
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Welcome to WorkHub Central</CardTitle>
                <CardDescription>Your central point for managing operational resources.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Use the navigation on the left to manage workstations, operational standards, and forms. You can create, view, and print details including QR codes for quick access on the shop floor.</p>
                <div className="mt-4">
                    <Button asChild>
                        <Link href="/workstations/new">Create New Workstation</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
