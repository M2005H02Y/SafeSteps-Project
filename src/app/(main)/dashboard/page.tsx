import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Building2, 
  BookCheck, 
  FileText, 
  Cog,
  PlusCircle,
  FileUp,
  LineChart
} from 'lucide-react';

const stats = [
  { title: 'Postes de travail', value: '12', icon: <Building2 className="h-8 w-8 text-blue-500" />, change: "+2%", changeType: 'positive' as const, href: '/workstations' },
  { title: 'Standards Actifs', value: '8', icon: <BookCheck className="h-8 w-8 text-green-500" />, change: "Stable", changeType: 'neutral' as const, href: '/standards' },
  { title: 'Formulaires Remplis', value: '1,250', icon: <FileText className="h-8 w-8 text-purple-500" />, change: "+15%", changeType: 'positive' as const, href: '/forms' },
  { title: 'Anomalies Signalées', value: '3', icon: <LineChart className="h-8 w-8 text-red-500" />, change: "-5%", changeType: 'negative' as const, href: '/anomalies' },
];

const engines = [
  "NIV KOM", "ARR CAT", "Bulls D9", "Bulls D11", "Camion ravitaillement GO CAT", 
  "Chargeuse 992K", "Chargeuse 994F", "NIV CAT", "Paydozer KOM", 
  "Sondeuse DKS", "Sondeuse SKF"
];

const quickActions = [
    { title: "Nouveau Poste", icon: <PlusCircle className="h-10 w-10" />, href: "/workstations/new", description: "Configurer un nouveau poste de travail." },
    { title: "Nouveau Standard", icon: <FileUp className="h-10 w-10" />, href: "/standards/new", description: "Rédiger et publier une nouvelle norme." },
    { title: "Nouveau Formulaire", icon: <FileText className="h-10 w-10" />, href: "/forms/new", description: "Créer un nouveau formulaire configurable." },
]


export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Vue d'ensemble de l'activité du système de gestion industrielle.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="glass-effect p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-slate-700">{stat.title}</h3>
                    {stat.icon}
                </div>
                <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-slate-500'}`}>
                        {stat.change} vs mois dernier
                    </p>
                </div>
            </Card>
          ))}
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Engines Section */}
            <Card className="glass-effect p-6 lg:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                  <Cog className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-slate-900">Engines Configurés</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
                  {engines.map(engine => (
                    <Link key={engine} href={`/workstations?engine=${encodeURIComponent(engine)}`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>{engine}</span>
                    </Link>
                  ))}
                  <Link href="/workstations/new" className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors cursor-pointer">
                      <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                      <span>Ajouter un engine...</span>
                  </Link>
              </div>
            </Card>
        </div>
        
        {/* Quick Actions */}
        <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Actions Rapides</h3>
            <div className="grid gap-6 md:grid-cols-3">
                {quickActions.map(action => (
                    <Link href={action.href} key={action.title}>
                        <Card className="glass-effect p-6 text-center hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1">
                            <div className="flex justify-center text-primary mb-3">
                                {action.icon}
                            </div>
                            <h4 className="font-bold text-lg text-slate-900">{action.title}</h4>
                            <p className="text-sm text-slate-600">{action.description}</p>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>

      </main>
    </div>
  );
}
