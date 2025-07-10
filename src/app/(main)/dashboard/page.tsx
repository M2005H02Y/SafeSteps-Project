
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Building2, 
  BookCheck, 
  FileText, 
  Cog,
  PlusCircle,
  FileUp,
  ScanLine,
  FileCheck2,
  BarChart3,
  BookOpen,
  ClipboardList
} from 'lucide-react';
import { getWorkstationsCount, getStandardsCount, getFormsCount, getAnalyticsSummary, AnalyticsSummary } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"


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
        <Skeleton className="h-4 w-32 mt-1" />
      </div>
    </Card>
  );
}

function ChartSkeleton() {
    return (
        <Card className="p-6 h-[400px] flex flex-col">
            <CardHeader className="p-0 mb-4">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <Skeleton className="h-full w-full" />
            </CardContent>
        </Card>
    )
}

function AnalyticsChart({ data, type = 'daily' }: { data: { name: string; value: number }[], type?: 'daily' | 'item' }) {
    if (data.every(d => d.value === 0)) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <BarChart3 className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold">Pas encore de données</h3>
                <p className="mt-2">Les données de consultation apparaîtront ici une fois collectées.</p>
            </div>
        )
    }

    const isDailyData = type === 'daily';
    const angle = isDailyData ? -45 : (data.length > 5 ? -45 : 0);
    const textAnchor = angle < 0 ? 'end' : 'middle';
    const height = angle < 0 ? 70 : 30;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    angle={angle}
                    textAnchor={textAnchor}
                    height={height}
                    interval={0}
                />
                <YAxis 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                    allowDecimals={false}
                    width={30}
                />
                <Tooltip 
                    cursor={{fill: 'hsl(var(--accent))', radius: '0.5rem'}}
                    contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                    }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}


export default function DashboardPage() {
  const [stats, setStats] = useState([
    { title: 'Postes de travail', value: '0', icon: <Building2 className="h-8 w-8 text-blue-500" />, href: '/workstations' },
    { title: 'Standards Actifs', value: '0', icon: <BookCheck className="h-8 w-8 text-green-500" />, href: '/standards' },
    { title: 'Formulaires', value: '0', icon: <FileText className="h-8 w-8 text-purple-500" />, href: '/forms' },
  ]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllStats() {
      setLoading(true);
      try {
        const [
            workstationCount, 
            standardCount, 
            formCount, 
            analyticsSummary
        ] = await Promise.all([
          getWorkstationsCount(),
          getStandardsCount(),
          getFormsCount(),
          getAnalyticsSummary()
        ]);

        setStats(prevStats => [
            { ...prevStats[0], value: workstationCount.toString() },
            { ...prevStats[1], value: standardCount.toString() },
            { ...prevStats[2], value: formCount.toString() },
        ]);
        setAnalytics(analyticsSummary);

      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllStats();
  }, []);

  const analyticsCards = analytics ? [
      { title: "QR Codes Scannés", value: analytics.scansLast7Days, icon: <ScanLine className="h-8 w-8 text-cyan-500"/>, description: "7 derniers jours" },
      { title: "Consultations Standards", value: analytics.standardsConsultationsLast7Days, icon: <BookOpen className="h-8 w-8 text-orange-500"/>, description: "7 derniers jours" },
      { title: "Consultations Formulaires", value: analytics.formsConsultationsLast7Days, icon: <ClipboardList className="h-8 w-8 text-indigo-500"/>, description: "7 derniers jours" },
      { title: "Formulaires Remplis", value: analytics.formsFilledLast7Days, icon: <FileCheck2 className="h-8 w-8 text-emerald-500"/>, description: "7 derniers jours" }
  ] : [];

  const chartRow1 = [
    { title: "Consultations par Engine", description: "Nombre de scans par type de poste (30j).", data: analytics?.consultationsByEngine, type: 'item' },
    { title: "Top Standards Consultés", description: "Les standards les plus vus (30j).", data: analytics?.consultationsByStandard, type: 'item' },
    { title: "Top Formulaires Consultés", description: "Les formulaires les plus vus (30j).", data: analytics?.consultationsByForm, type: 'item' }
  ];

  const chartRow2 = [
    { title: "Scans Quotidiens des Postes", description: "Activité quotidienne (30j).", data: analytics?.consultationsByDayWorkstations, type: 'daily' },
    { title: "Consultations Quot. des Standards", description: "Activité quotidienne (30j).", data: analytics?.consultationsByDayStandards, type: 'daily' },
    { title: "Consultations Quot. des Formulaires", description: "Activité quotidienne (30j).", data: analytics?.consultationsByDayForms, type: 'daily' }
  ];


  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Vue d'ensemble de l'activité de SafeSteps.</p>
          </div>
        </div>

        {/* --- STATS & ACTIONS --- */}
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

        {/* --- ANALYTICS CARDS (7 DAYS) --- */}
        <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Analyse d'Activité (7 derniers jours)</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    analyticsCards.map((stat) => (
                        <Card key={stat.title} className="glass-effect p-6 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-slate-700">{stat.title}</h3>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
        
        {/* --- CHARTS (30 DAYS) --- */}
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Consultations par Élément (30 derniers jours)</h2>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <ChartSkeleton key={i} />)
                    ) : (
                        chartRow1.map((chart) => (
                            <Card key={chart.title} className="glass-effect p-6 h-[400px] flex flex-col">
                                <CardHeader className="p-0 mb-4">
                                    <CardTitle>{chart.title}</CardTitle>
                                    <CardDescription>{chart.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 flex-1">
                                    {chart.data && <AnalyticsChart data={chart.data} type={chart.type as 'daily' | 'item'} />}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Activité Quotidienne (30 derniers jours)</h2>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <ChartSkeleton key={i} />)
                    ) : (
                        chartRow2.map((chart) => (
                            <Card key={chart.title} className="glass-effect p-6 h-[400px] flex flex-col">
                                <CardHeader className="p-0 mb-4">
                                    <CardTitle>{chart.title}</CardTitle>
                                    <CardDescription>{chart.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 flex-1">
                                    {chart.data && <AnalyticsChart data={chart.data} type={chart.type as 'daily' | 'item'} />}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
        
        {/* --- CONFIG & QUICK ACTIONS --- */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <Card className="glass-effect p-6 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                  <Cog className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-slate-900">Engines Configurés</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-3">
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

            <div className="lg:col-span-2">
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
        </div>

      </main>
    </div>
  );
}
