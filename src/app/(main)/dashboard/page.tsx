
"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Building2, 
  BookCheck, 
  FileText, 
  Cog,
  PlusCircle,
  FileUp
} from 'lucide-react';
import { getWorkstationsCount, getStandardsCount, getFormsCount } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const engines = [
  "NIV KOM", "ARR CAT", "Bulls D9", "Bulls D11", "Camion ravitaillement GO CAT", 
  "Chargeuse 992K", "Chargeuse 994F", "NIV CAT", "Paydozer KOM", 
  "Sondeuse DKS", "Sondeuse SKF"
];

const quickActions = [
    { title: "Nouveau Poste", icon: <PlusCircle className="h-10 w-10" />, href: "/workstations/new", description: "Configurer un nouveau poste de travail." },
    { title: "Nouveau Standard", icon: <FileUp className="h-10 w-10" />, href: "/standards/new", description: "Rédiger et publier une nouvelle norme." },
    { title: "Nouveau Formulaire", icon: <FileText className="h-10 w-10" />, href: "/forms/new", description: "Créer un nouveau formulaire configurable." },
];

function StatCardSkeleton() {
  return (
    <Card className="p-6 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div>
        <Skeleton className="h-8 w-12" />
      </div>
    </Card>
  );
}


export default function DashboardPage() {
  const [stats, setStats] = useState([
    { title: 'Postes de travail', value: '0', icon: <Building2 className="h-8 w-8 text-blue-500" />, href: '/workstations' },
    { title: 'Standards Actifs', value: '0', icon: <BookCheck className="h-8 w-8 text-green-500" />, href: '/standards' },
    { title: 'Formulaires', value: '0', icon: <FileText className="h-8 w-8 text-purple-500" />, href: '/forms' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [workstationCount, standardCount, formCount] = await Promise.all([
          getWorkstationsCount(),
          getStandardsCount(),
          getFormsCount(),
        ]);

        setStats(prevStats => [
            { ...prevStats[0], value: workstationCount.toString() },
            { ...prevStats[1], value: standardCount.toString() },
            { ...prevStats[2], value: formCount.toString() },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Vue d'ensemble de l'activité de WorkHub Central.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            stats.map((stat) => (
              <Link href={stat.href} key={stat.title} className="block hover:-translate-y-1 transition-transform duration-200">
                <Card className="glass-effect p-6 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 h-full">
                    <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium text-slate-700">{stat.title}</h3>
                        {stat.icon}
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                </Card>
              </Link>
            ))
          )}
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
                  <Link href="/workstations/new?newEngine=true" className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary transition-colors cursor-pointer">
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
