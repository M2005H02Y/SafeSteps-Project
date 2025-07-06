
export type FileAttachment = {
  name: string;
  url: string; // Firebase Storage URL
  type: 'image' | 'pdf' | 'excel' | 'other';
};

export const engineTypes = [
  "NIV KOM", "ARR CAT", "Bulls D9", "Bulls D11", "Camion ravitaillement GO CAT", 
  "Chargeuse 992K", "Chargeuse 994F", "NIV CAT", "Paydozer KOM", 
  "Sondeuse DKS", "Sondeuse SKF"
];

export type Workstation = {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  image?: string;
  files?: FileAttachment[];
  tableData?: { [key: string]: string }[];
};

export type Standard = {
  id: string;
  name: string;
  category: string;
  version: string;
  description?: string;
  image?: string;
  files?: FileAttachment[];
};

// New types for dynamic forms
export interface CellData {
  content: string;
  image?: string;
  colspan?: number;
  rowspan?: number;
  merged?: boolean;
  header?: string;
}

export interface TableData {
  rows: number;
  cols: number;
  data: Record<string, CellData>;
  headers?: string[];
}

export type Form = {
  id: string;
  name: string;
  lastUpdated: string;
  tableData?: TableData;
  files?: FileAttachment[];
};


const initialWorkstations: Workstation[] = [
  {
    id: 'ws-001',
    name: "Ligne d'assemblage Alpha",
    type: "Chargeuse 992K",
    description: "Ligne d'assemblage principale pour la fabrication de composants.",
    createdAt: "2024-05-21",
    image: 'https://res.cloudinary.com/dznopvi7n/image/upload/v1716305024/prod/photo-1581092921434-08d195a4f571_p8efqs.jpg',
    files: [],
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
    type: "Bulls D9",
    description: "Poste de préparation finale pour l'emballage et l'expédition.",
    createdAt: "2024-05-18",
    image: 'https://res.cloudinary.com/dznopvi7n/image/upload/v1716305024/prod/photo-1581092921434-08d195a4f571_p8efqs.jpg',
    files: [],
    tableData: [
      { etape: '1', tache: 'Mise en boîte du produit', duree: '10 min' },
      { etape: '2', tache: 'Impression des étiquettes', duree: '5 min' },
      { etape: '3', tache: 'Palettisation', duree: '25 min' },
    ],
  },
];

const initialStandards: Standard[] = [
  { id: 'std-iso-9001', name: 'ISO 9001:2015', category: 'Management de la qualité', version: '2015', description: "Cette norme spécifie les exigences relatives aux systèmes de management de la qualité lorsqu'un organisme doit démontrer son aptitude à fournir constamment des produits et des services conformes aux exigences des clients et aux exigences légales et réglementaires applicables.", image: 'https://res.cloudinary.com/dznopvi7n/image/upload/v1716305024/prod/photo-1581092921434-08d195a4f571_p8efqs.jpg', files: [] },
  { id: 'std-iso-14001', name: 'ISO 14001:2015', category: 'Management environnemental', version: '2015', description: 'Cette norme spécifie les exigences relatives à un système de management environnemental pour permettre à un organisme de développer et de mettre en œuvre une politique et des objectifs qui prennent en compte les exigences légales et les autres exigences, ainsi que les informations sur les aspects environnementaux significatifs.', image: 'https://res.cloudinary.com/dznopvi7n/image/upload/v1716305024/prod/photo-1581092921434-08d195a4f571_p8efqs.jpg', files: [] },
];

const initialForms: Form[] = [
  { 
    id: 'form-01', 
    name: "Check-list quotidienne de l'équipement", 
    lastUpdated: '2024-05-20',
    files: [],
    tableData: {
      rows: 2,
      cols: 2,
      headers: ["Point de Contrôle", "Statut"],
      data: {
        "0-0": { content: "Niveau d'huile" },
        "0-1": { content: "" },
        "1-0": { content: "Pression des pneus" },
        "1-1": { content: "" },
      }
    }
  },
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

function saveToStorage<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') {
        return false;
    }
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
        return false;
    }
}

export const getFileType = (file: File): FileAttachment['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) return 'excel';
    return 'other';
}

// Workstation Functions
export function getWorkstations(): Workstation[] {
  return getFromStorage('workstations', initialWorkstations);
}

export function addWorkstation(workstation: Omit<Workstation, 'id' | 'createdAt'>): boolean {
  const workstations = getWorkstations();
  const newWorkstation: Workstation = { 
      id: `ws-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      name: workstation.name,
      type: workstation.type,
      description: workstation.description,
      image: workstation.image,
      files: workstation.files || [],
      tableData: workstation.tableData || [],
  };
  const updatedWorkstations = [newWorkstation, ...workstations];
  return saveToStorage('workstations', updatedWorkstations);
}

export function getWorkstationById(id: string): Workstation | undefined {
  const workstations = getWorkstations();
  return workstations.find(ws => ws.id === id);
}

export function updateWorkstation(id: string, data: Partial<Omit<Workstation, 'id' | 'createdAt'>>): boolean {
    const workstations = getWorkstations();
    const index = workstations.findIndex(ws => ws.id === id);
    if (index === -1) return false;
    
    workstations[index] = { ...workstations[index], ...data };
    
    return saveToStorage('workstations', workstations);
}

export function deleteWorkstation(id: string): boolean {
    let workstations = getWorkstations();
    workstations = workstations.filter(ws => ws.id !== id);
    return saveToStorage('workstations', workstations);
}

// Standard Functions
export function getStandards(): Standard[] {
  return getFromStorage('standards', initialStandards);
}

export function addStandard(standard: Omit<Standard, 'id'>): boolean {
  const standards = getStandards();
  const newStandard: Standard = { 
      id: `std-${Date.now()}`,
      name: standard.name,
      category: standard.category,
      version: standard.version,
      description: standard.description,
      image: standard.image,
      files: standard.files || []
  };
  const updatedStandards = [newStandard, ...standards];
  return saveToStorage('standards', updatedStandards);
}

export function getStandardById(id: string): Standard | undefined {
    const standards = getStandards();
    return standards.find(s => s.id === id);
}

export function updateStandard(id: string, data: Partial<Omit<Standard, 'id'>>): boolean {
    const standards = getStandards();
    const index = standards.findIndex(s => s.id === id);
    if (index === -1) return false;

    standards[index] = { ...standards[index], ...data };
    
    return saveToStorage('standards', standards);
}

export function deleteStandard(id: string): boolean {
    let standards = getStandards();
    standards = standards.filter(s => s.id !== id);
    return saveToStorage('standards', standards);
}

// Form Functions
export function getForms(): Form[] {
  return getFromStorage('forms', initialForms);
}

export function addForm(form: Omit<Form, 'id' | 'lastUpdated'>): boolean {
    const forms = getForms();
    const newForm: Form = { 
        id: `form-${Date.now()}`,
        name: form.name,
        tableData: form.tableData,
        files: form.files || [],
        lastUpdated: new Date().toISOString().split('T')[0],
    };
    const updatedForms = [newForm, ...forms];
    return saveToStorage('forms', updatedForms);
}

export function getFormById(id: string): Form | undefined {
    const forms = getForms();
    return forms.find(f => f.id === id);
}

export function updateForm(id: string, data: Partial<Omit<Form, 'id' | 'lastUpdated'>>): boolean {
    const forms = getForms();
    const index = forms.findIndex(f => f.id === id);
    if (index === -1) return false;

    forms[index] = { ...forms[index], ...data, lastUpdated: new Date().toISOString().split('T')[0] };

    return saveToStorage('forms', forms);
}

export function deleteForm(id: string): boolean {
    let forms = getForms();
    forms = forms.filter(f => f.id !== id);
    return saveToStorage('forms', forms);
}
