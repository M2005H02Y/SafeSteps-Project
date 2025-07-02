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
    name: 'Assembly Line Alpha',
    description: 'Primary assembly line for component manufacturing.',
    image: 'https://placehold.co/600x400.png',
    files: [{ name: 'safety-protocol.pdf', url: '/safety-protocol.pdf', type: 'pdf' }, { name: 'parts-list.xlsx', url: '#', type: 'excel' }],
    tableData: [
      { step: '1', task: 'Component Inspection', duration: '15 mins' },
      { step: '2', task: 'Sub-assembly', duration: '45 mins' },
      { step: '3', task: 'Final Assembly', duration: '30 mins' },
      { step: '4', task: 'Quality Check', duration: '20 mins' },
    ],
  },
  {
    id: 'ws-002',
    name: 'Packaging Station Bravo',
    description: 'Final packaging and shipping preparation station.',
    image: 'https://placehold.co/600x400.png',
    files: [{ name: 'shipping-manifest-template.pdf', url: '/shipping-manifest-template.pdf', type: 'pdf' }],
    tableData: [
      { step: '1', task: 'Product Boxing', duration: '10 mins' },
      { step: '2', task: 'Label Printing', duration: '5 mins' },
      { step: '3', task: 'Palletizing', duration: '25 mins' },
    ],
  },
];

export const standards: Standard[] = [
  { id: 'std-iso-9001', name: 'ISO 9001:2015', category: 'Quality Management', version: '2015', image: 'https://placehold.co/600x400.png', files: [{ name: 'iso-9001-summary.pdf', url: '/iso-9001-summary.pdf', type: 'pdf' }] },
  { id: 'std-iso-14001', name: 'ISO 14001:2015', category: 'Environmental Management', version: '2015', image: 'https://placehold.co/600x400.png' },
];

export const forms: Form[] = [
  { id: 'form-01', name: 'Daily Equipment Checklist', type: 'Safety', lastUpdated: '2024-05-20' },
  { id: 'form-02', name: 'Incident Report Form', type: 'Safety', lastUpdated: '2024-01-15' },
  { id: 'form-03', name: 'Production Output Log', type: 'Operations', lastUpdated: '2024-06-01', files: [{ name: 'sample-log.pdf', url: '/sample-log.pdf', type: 'pdf' }, { name: 'log-template.xlsx', url: '#', type: 'excel' }] },
];
