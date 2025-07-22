
import { notFound } from 'next/navigation';
import { getWorkstationById, Workstation, logAnalyticsEvent } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { 
    File as FileIcon, 
    FileText as FileTextIcon, 
    Download, 
    ImageIcon, 
    FileSpreadsheet,
    ShieldCheck,
    HardHat,
    FileCheck,
    Biohazard,
    Shirt,
    Footprints,
    Hand,
    Glasses,
    Wind,
    EarOff,
    Activity,
    Shield,
    FileText,
    Mountain,
    Flame,
    Atom,
    Thermometer,
    Leaf,
    Bot,
    Drama,
    Search,
    Users,
    Award,
    Wrench,
    AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import OcpLogo from '@/app/ocplogo.png';

const safetyIconMap: { [key: string]: React.ReactNode } = {
  // EPI
  'Tenue de Travail': <Shirt className="h-4 w-4 text-muted-foreground" />,
  'Casque': <HardHat className="h-4 w-4 text-muted-foreground" />,
  'Chaussures de sécurité': <Footprints className="h-4 w-4 text-muted-foreground" />,
  'Gants de sécurité ordinaires': <Hand className="h-4 w-4 text-muted-foreground" />,
  'Lunettes de Protection Ordinaires': <Glasses className="h-4 w-4 text-muted-foreground" />,
  'Masque à gaz': <Wind className="h-4 w-4 text-muted-foreground" />,
  'Casque anti-Bruit': <EarOff className="h-4 w-4 text-muted-foreground" />,
  'Harnais de sécurité': <Activity className="h-4 w-4 text-muted-foreground" />,
  'Écran Facial': <Shield className="h-4 w-4 text-muted-foreground" />,
  'Masque anti-poussière': <Wind className="h-4 w-4 text-muted-foreground" />,
  // Permis
  'Autorisation de Travail': <FileText className="h-4 w-4 text-muted-foreground" />,
  'Plan de Consignation': <FileText className="h-4 w-4 text-muted-foreground" />,
  'Espace Confiné': <Search className="h-4 w-4 text-muted-foreground" />,
  'Travaux en Hauteur': <Mountain className="h-4 w-4 text-muted-foreground" />,
  'Permis de Fouille': <Search className="h-4 w-4 text-muted-foreground" />,
  'Permis de Feu': <Flame className="h-4 w-4 text-muted-foreground" />,
  // Risques
  'Dangers Chimiques': <Atom className="h-5 w-5 text-destructive" />,
  'Dangers Physiques': <Thermometer className="h-5 w-5 text-destructive" />,
  'Dangers Environnementaux': <Leaf className="h-5 w-5 text-destructive" />,
  'Dangers Biologiques': <Biohazard className="h-5 w-5 text-destructive" />,
  'Dangers Ergonomiques': <Bot className="h-5 w-5 text-destructive" />,
  'Autres Dangers': <Drama className="h-5 w-5 text-destructive" />,
};

async function WorkstationPublicPage({ params }: { params: { id: string } }) {
  const workstation = await getWorkstationById(params.id);

  if (workstation) {
    // Fire-and-forget logging
    logAnalyticsEvent({
        event_type: 'consultation',
        target_type: 'workstation',
        target_id: workstation.id,
        target_details: { type: workstation.type }
    });
  } else {
    notFound();
  }

  const hasSafetyData = (workstation.epi && workstation.epi.length > 0) || 
                       (workstation.special_permits && workstation.special_permits.length > 0) || 
                       (workstation.risks && workstation.risks.length > 0);
  
  const hasAdditionalInfo = workstation.human_resources || workstation.required_authorizations || workstation.material_resources || workstation.specific_instructions;

  const predefinedSafetyLabels = Object.keys(safetyIconMap);

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg p-2">
                <Image src={OcpLogo} alt="SafeSteps Logo" width={96} height={96} className="h-full w-full object-contain rounded-full" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">SafeSteps</h1>
            <p className="text-muted-foreground mt-1">Votre sécurité, notre priorité.</p>
        </div>
        
        <Card className="overflow-hidden">
          {workstation.image && (
            <div className="relative aspect-video w-full">
              <Image src={workstation.image} alt={workstation.name} fill className="object-cover" data-ai-hint="assembly line"/>
            </div>
          )}
          <CardHeader>
            <Badge variant="secondary" className="w-fit mb-2">{workstation.type}</Badge>
            <CardTitle className="text-2xl">{workstation.name}</CardTitle>
            {workstation.description && (
                <CardDescription>{workstation.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {hasSafetyData && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary"/> Informations de Sécurité</h3>
                  
                  {workstation.epi && workstation.epi.length > 0 && (
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><HardHat className="h-5 w-5"/>EPI Requis</h4>
                      <ul className="space-y-2 text-sm">
                          {workstation.epi.map(item => {
                            const isPredefined = predefinedSafetyLabels.includes(item);
                            const label = isPredefined ? item : `Autre EPI: ${item}`;
                            const icon = safetyIconMap[item] || <FileIcon className="h-4 w-4" />;
                            
                            if (item === 'Autre (EPI)') return null;

                            return (
                                <li key={item} className="flex items-center gap-3 text-muted-foreground">
                                    {icon}
                                    <span>{label}</span>
                                </li>
                            );
                          })}
                      </ul>
                    </div>
                  )}

                  {workstation.special_permits && workstation.special_permits.length > 0 && (
                     <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><FileCheck className="h-5 w-5"/>Permis Spéciaux</h4>
                       <ul className="space-y-2 text-sm">
                          {workstation.special_permits.map(item => {
                            const isPredefined = predefinedSafetyLabels.includes(item);
                            const label = isPredefined ? item : `Autre Permis: ${item}`;
                            const icon = safetyIconMap[item] || <FileIcon className="h-4 w-4" />;

                            if (item === 'Autre (Permis)') return null;

                            return (
                                <li key={item} className="flex items-center gap-3 text-muted-foreground">
                                    {icon}
                                    <span>{label}</span>
                                </li>
                            );
                          })}
                      </ul>
                    </div>
                  )}

                  {workstation.risks && workstation.risks.length > 0 && (
                     <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><Biohazard className="h-5 w-5"/>Risques Identifiés</h4>
                       <div className="space-y-2 text-sm">
                        {workstation.risks.map(risk => (
                          <div key={risk.category} className="p-2 border-l-4 border-destructive/50 bg-destructive/10 rounded-r-md">
                            <p className="font-semibold text-destructive flex items-center gap-2">
                               {safetyIconMap[risk.category] || <Biohazard className="h-5 w-5 text-destructive" />}
                               {risk.category}
                            </p>
                            <p className="text-muted-foreground pl-9">{risk.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
            )}

            {hasAdditionalInfo && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><FileText className="h-6 w-6 text-primary"/> Informations Complémentaires</h3>
                   {workstation.human_resources && <div><h4 className="font-semibold flex items-center gap-2 mb-1"><Users className="h-5 w-5"/>Moyens Humains</h4><p className="text-muted-foreground text-sm whitespace-pre-wrap">{workstation.human_resources}</p></div>}
                    {workstation.required_authorizations && <div><h4 className="font-semibold flex items-center gap-2 mb-1"><Award className="h-5 w-5"/>Habilitations</h4><p className="text-muted-foreground text-sm whitespace-pre-wrap">{workstation.required_authorizations}</p></div>}
                    {workstation.material_resources && <div><h4 className="font-semibold flex items-center gap-2 mb-1"><Wrench className="h-5 w-5"/>Moyens Matériels</h4><p className="text-muted-foreground text-sm whitespace-pre-wrap">{workstation.material_resources}</p></div>}
                    {workstation.specific_instructions && <div><h4 className="font-semibold flex items-center gap-2 mb-1"><AlertTriangle className="h-5 w-5"/>Consignes Particulières</h4><p className="text-muted-foreground text-sm whitespace-pre-wrap">{workstation.specific_instructions}</p></div>}
                </div>
            )}


            {workstation.files && workstation.files.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Fichiers joints</h3>
                  {workstation.files.map(file => (
                    <a href={file.url} key={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-md border bg-background/50 hover:bg-accent/80 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {file.type === 'pdf' && <FileTextIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
                        {file.type === 'excel' && <FileSpreadsheet className="h-5 w-5 text-green-500 flex-shrink-0" />}
                        {file.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                        {file.type === 'other' && <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />}
                        <span className="text-sm font-medium truncate">{file.name}</span>
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground ml-2"/>
                    </a>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default WorkstationPublicPage;
