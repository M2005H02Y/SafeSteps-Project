export type Workstation = {
  id: string;
  name: string;
  description: string;
  image?: string;
  files?: { name: string; url: string; type: 'pdf' | 'excel' }[];
  tableData?: { [key: string]: string }[];
};

export type Standard = {
  id: string;
  name: string;
  category: string;
  version: string;
  image?: string;
  files?: { name: string; url: string; type: 'pdf' | 'excel' }[];
};

export type Form = {
  id: string;
  name: string;
  type: string;
  lastUpdated: string;
  files?: { name: string; url: string; type: 'pdf' | 'excel' }[];
};

export const workstations: Workstation[] = [
  {
    id: 'ws-001',
    name: "Ligne d'assemblage Alpha",
    description: "Ligne d'assemblage principale pour la fabrication de composants.",
    image: 'https://placehold.co/600x400.png',
    files: [{ name: 'protocole-securite.pdf', url: '/protocole-securite.pdf', type: 'pdf' }, { name: 'liste-pieces.xlsx', url: '#', type: 'excel' }],
    tableData: [
      { etape: '1', tache: 'Inspection des composants', duree: '15 min' },
      { etape: '2', tache: 'Sous-assemblage', duree: '45 min' },
      { etape: '3', tache: 'Assemblage final', duree: '30 min' },
      { etape: '4', tache: 'Contrôle qualité', duree: '20 min' },
    ],
  },
  {
    id: 'ws-002',
    name: "Poste d'emballage Bravo",
    description: "Poste de préparation finale pour l'emballage et l'expédition.",
    image: 'https://placehold.co/600x400.png',
    files: [{ name: 'modele-bon-expedition.pdf', url: '/modele-bon-expedition.pdf', type: 'pdf' }],
    tableData: [
      { etape: '1', tache: 'Mise en boîte du produit', duree: '10 min' },
      { etape: '2', tache: 'Impression des étiquettes', duree: '5 min' },
      { etape: '3', tache: 'Palettisation', duree: '25 min' },
    ],
  },
];

export const standards: Standard[] = [
  { id: 'std-iso-9001', name: 'ISO 9001:2015', category: 'Management de la qualité', version: '2015', image: 'https://placehold.co/600x400.png', files: [{ name: 'resume-iso-9001.pdf', url: '/resume-iso-9001.pdf', type: 'pdf' }] },
  { id: 'std-iso-14001', name: 'ISO 14001:2015', category: 'Management environnemental', version: '2015', image: 'https://placehold.co/600x400.png' },
];

export const forms: Form[] = [
  { id: 'form-01', name: "Check-list quotidienne de l'équipement", type: 'Sécurité', lastUpdated: '2024-05-20' },
  { id: 'form-02', name: "Formulaire de rapport d'incident", type: 'Sécurité', lastUpdated: '2024-01-15' },
  { id: 'form-03', name: 'Journal de production', type: 'Opérations', lastUpdated: '2024-06-01', files: [{ name: 'exemple-journal.pdf', url: '/sample-log.pdf', type: 'pdf' }, { name: 'modele-journal.xlsx', url: '#', type: 'excel' }] },
];
