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
  description?: string;
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

const initialWorkstations: Workstation[] = [
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

const initialStandards: Standard[] = [
  { id: 'std-iso-9001', name: 'ISO 9001:2015', category: 'Management de la qualité', version: '2015', description: "Cette norme spécifie les exigences relatives aux systèmes de management de la qualité lorsqu'un organisme doit démontrer son aptitude à fournir constamment des produits et des services conformes aux exigences des clients et aux exigences légales et réglementaires applicables.", image: 'https://placehold.co/600x400.png', files: [{ name: 'resume-iso-9001.pdf', url: '/resume-iso-9001.pdf', type: 'pdf' }] },
  { id: 'std-iso-14001', name: 'ISO 14001:2015', category: 'Management environnemental', version: '2015', description: 'Cette norme spécifie les exigences relatives à un système de management environnemental pour permettre à un organisme de développer et de mettre en œuvre une politique et des objectifs qui prennent en compte les exigences légales et les autres exigences, ainsi que les informations sur les aspects environnementaux significatifs.', image: 'https://placehold.co/600x400.png' },
];

const initialForms: Form[] = [
  { id: 'form-01', name: "Check-list quotidienne de l'équipement", type: 'Sécurité', lastUpdated: '2024-05-20' },
  { id: 'form-02', name: "Formulaire de rapport d'incident", type: 'Sécurité', lastUpdated: '2024-01-15' },
  { id: 'form-03', name: 'Journal de production', type: 'Opérations', lastUpdated: '2024-06-01', files: [{ name: 'exemple-journal.pdf', url: '/sample-log.pdf', type: 'pdf' }, { name: 'modele-journal.xlsx', url: '#', type: 'excel' }] },
];

function getFromStorage<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    } else {
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return initialValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
    }
}

export function getWorkstations(): Workstation[] {
  return getFromStorage('workstations', initialWorkstations);
}

export function addWorkstation(workstation: Omit<Workstation, 'id' | 'image' | 'files' | 'tableData'>) {
  const workstations = getWorkstations();
  const newWorkstation: Workstation = { 
      ...workstation, 
      id: `ws-${Date.now()}`,
      image: 'https://placehold.co/600x400.png',
      files: [],
      tableData: []
  };
  const updatedWorkstations = [newWorkstation, ...workstations];
  saveToStorage('workstations', updatedWorkstations);
}

export function getWorkstationById(id: string): Workstation | undefined {
  const workstations = getWorkstations();
  return workstations.find(ws => ws.id === id);
}

export function getStandards(): Standard[] {
  return getFromStorage('standards', initialStandards);
}

export function addStandard(standard: Omit<Standard, 'id' | 'image' | 'files'>) {
  const standards = getStandards();
  const newStandard: Standard = { 
      ...standard, 
      id: `std-${Date.now()}`,
      image: 'https://placehold.co/600x400.png',
      files: []
  };
  const updatedStandards = [newStandard, ...standards];
  saveToStorage('standards', updatedStandards);
}

export function getStandardById(id: string): Standard | undefined {
    const standards = getStandards();
    return standards.find(s => s.id === id);
}

export function getForms(): Form[] {
  return getFromStorage('forms', initialForms);
}

export function addForm(form: Omit<Form, 'id' | 'lastUpdated' | 'files'>) {
    const forms = getForms();
    const newForm: Form = { 
        ...form, 
        id: `form-${Date.now()}`,
        lastUpdated: new Date().toISOString().split('T')[0],
        files: []
    };
    const updatedForms = [newForm, ...forms];
    saveToStorage('forms', updatedForms);
}

export function getFormById(id: string): Form | undefined {
    const forms = getForms();
    return forms.find(f => f.id === id);
}
