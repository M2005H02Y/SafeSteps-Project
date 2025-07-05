import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Building2, 
  BookCheck, 
  FileText, 
  ArrowRight,
  Cog,
  Users,
  Calendar,
  Activity,
  User,
  PlusCircle,
  FileUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const stats = [
  { title: 'Postes de travail', value: '12', icon: <Building2 className="h-6 w-6 text-slate-500" />, change: "+2%", changeType: 'positive' as const, href: '/workstations' },
  { title: 'Standards Actifs', value: '8', icon: <BookCheck className="h-6 w-6 text-slate-500" />, change: "Stable", changeType: 'neutral' as const, href: '/standards' },
  { title: 'Formulaires Remplis', value: '1,250', icon: <FileText className="h-6 w-6 text-slate-500" />, change: "+15%", changeType: 'positive' as const, href: '/forms' },
  { title: 'Utilisateurs Actifs', value: '45', icon: <Users className="h-6 w-6 text-slate-500" />, change: "-3%", changeType: 'negative' as const, href: '#' },
];

const recentActivities = [
  { type: 'STANDARD', action: 'créé', target: 'ISO 9001:2024', user: 'A. Dupont', time: '2h ago', status: 'green' as const },
  { type: 'POSTE', action: 'modifié', target: 'Ligne Alpha', user: 'B. Martin', time: '5h ago', status: 'blue' as const },
  { type: 'FORM', action: 'rempli', target: 'Check-list Sécurité', user: 'C. Durand', time: '8h ago', status: 'purple' as const },
  { type: 'POSTE', action: 'supprimé', target: 'Zone de Test', user: 'A. Dupont', time: '1d ago', status: 'red' as const },
  { type: 'STANDARD', action: 'archivé', target: 'ISO 14001:2015', user: 'B. Martin', time: '2d ago', status: 'yellow' as const },
];

const engines = [
  "Bulls D11", "CAT 797F", "Komatsu 930E", "Liebherr T 282C", "Hitachi EH5000AC", 
  "BelAZ 75710", "Terex MT 6300AC", "Volvo A60H", "Scania R 730", 
  "MAN TGX", "Mercedes Actros"
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
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-white/80">
              <Calendar className="mr-2 h-4 w-4" />
              Rapport Mensuel
            </Button>
            <Button className="bg-gradient-primary text-white">
              <Activity className="mr-2 h-4 w-4" />
              Export Global
            </Button>
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
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-slate-500'}`}>
                        {stat.change} vs mois dernier
                    </p>
                </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Engines Section */}
          <div className="lg:col-span-2">
            <Card className="glass-effect p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Cog className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-slate-900">Engines Configurés</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
                {engines.map(engine => (
                  <div key={engine} className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors cursor-pointer">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>{engine}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors cursor-pointer">
                    <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                    <span>Ajouter un engine...</span>
                  </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <div className="lg:col-span-1">
            <Card className="glass-effect p-6 h-full">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Activité Récente</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={`https://i.pravatar.cc/40?u=${activity.user}`} />
                        <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="text-slate-800">
                        <span className="font-semibold">{activity.user}</span> a {activity.action} le {activity.type.toLowerCase()} <span className="font-semibold text-primary">{activity.target}</span>.
                      </p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
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
