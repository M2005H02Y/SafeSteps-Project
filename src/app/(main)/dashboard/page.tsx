import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, BookCheck, FileText, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { title: 'Postes de travail', count: 2, icon: <Building2 className="h-6 w-6 text-muted-foreground" />, href: '/workstations' },
    { title: 'Normes', count: 2, icon: <BookCheck className="h-6 w-6 text-muted-foreground" />, href: '/standards' },
    { title: 'Formulaires', count: 3, icon: <FileText className="h-6 w-6 text-muted-foreground" />, href: '/forms' },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Tableau de bord" />
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
                <p className="text-xs text-muted-foreground">Total d'éléments actifs</p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href={stat.href}>
                    Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Bienvenue sur WorkHub Central</CardTitle>
                <CardDescription>Votre point central pour la gestion des ressources opérationnelles.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Utilisez la navigation à gauche pour gérer les postes de travail, les normes opérationnelles et les formulaires. Vous pouvez créer, afficher et imprimer les détails, y compris les codes QR pour un accès rapide en atelier.</p>
                <div className="mt-4">
                    <Button asChild>
                        <Link href="/workstations/new">Créer un nouveau poste de travail</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
