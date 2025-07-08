
import { notFound } from 'next/navigation';
import { getWorkstationById, Workstation, getStandardById, Standard, getFormById, Form } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Globe } from 'lucide-react';

async function PublicWorkstation({ id }: { id: string }) {
  const workstation = await getWorkstationById(id);
  if (!workstation) notFound();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{workstation.name}</CardTitle>
        <CardDescription>
            <Badge variant="secondary">{workstation.type}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {workstation.image && (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
            <Image src={workstation.image} alt={workstation.name} fill className="object-cover" data-ai-hint="assembly line" />
          </div>
        )}
        <p className="text-sm text-muted-foreground">{workstation.description}</p>
      </CardContent>
    </Card>
  );
}

async function PublicStandard({ id }: { id: string }) {
  const standard = await getStandardById(id);
  if (!standard) notFound();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{standard.name}</CardTitle>
        <CardDescription>
          <Badge variant="outline" className="mr-2">{standard.category}</Badge>
          <Badge variant="secondary">{standard.version}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {standard.image && (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
            <Image src={standard.image} alt={standard.name} fill className="object-cover" data-ai-hint="certificate document" />
          </div>
        )}
        <p className="text-sm text-muted-foreground">{standard.description}</p>
      </CardContent>
    </Card>
  );
}

async function PublicForm({ id }: { id: string }) {
    const form = await getFormById(id);
    if (!form) notFound();
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{form.name}</CardTitle>
                <CardDescription>Formulaire</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    Ce formulaire peut être rempli depuis l'application principale.
                    {form.table_data && ' Il contient un tableau structuré.'}
                </p>
            </CardContent>
        </Card>
    );
}

export default async function PublicPage({ params }: { params: { slug: string[] } }) {
  const [type, id] = params.slug;

  let content;
  if (type === 'workstation' && id) {
    content = <PublicWorkstation id={id} />;
  } else if (type === 'standard' && id) {
    content = <PublicStandard id={id} />;
  } else if (type === 'form' && id) {
    content = <PublicForm id={id} />;
  } else {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-8">
        <div className="w-full max-w-2xl mx-auto">
            <header className="flex flex-col items-center text-center mb-8">
                <Image src="/logo.jpg" alt="SafeSteps Logo" width={80} height={80} className="object-contain mb-4" />
                <h1 className="text-3xl font-bold text-slate-800">SafeSteps</h1>
                <p className="text-slate-500">Information Publique</p>
            </header>
            
            <div className="w-full">
                {content}
            </div>

            <footer className="mt-8 text-center text-slate-400 text-sm">
                <p>Propulsé par SafeSteps. Rendez-vous sur notre site pour plus d'informations.</p>
                <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline mt-2">
                    <Globe className="h-4 w-4" />
                    Accéder à l'application
                </Link>
            </footer>
        </div>
    </main>
  );
}
