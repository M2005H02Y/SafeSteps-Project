
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Risk } from '@/lib/data';
import { 
    HardHat, FileCheck, Biohazard, ShieldQuestion, Construction, Wind, Ear, Activity, Eye, Footprints, Thermometer,
    FileText, Search, Mountain, Flame, Atom, Leaf, Bot, Drama, Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';

// --- Data Definitions ---
const epiItems = [
    { id: 'tenue-de-travail', label: 'Tenue de Travail', icon: <Construction /> },
    { id: 'casque', label: 'Casque', icon: <HardHat /> },
    { id: 'chaussures-securite', label: 'Chaussures de sécurité', icon: <Footprints /> },
    { id: 'gants-securite', label: 'Gants de sécurité ordinaires', icon: <Construction /> },
    { id: 'lunettes-protection', label: 'Lunettes de Protection Ordinaires', icon: <Eye /> },
    { id: 'masque-a-gaz', label: 'Masque à gaz', icon: <Wind /> },
    { id: 'casque-anti-bruit', label: 'Casque anti-Bruit', icon: <Ear /> },
    { id: 'harnais-securite', label: 'Harnais de sécurité', icon: <Activity /> },
    { id: 'ecran-facial', label: 'Écran Facial', icon: <ShieldQuestion /> },
    { id: 'masque-anti-poussiere', label: 'Masque anti-poussière', icon: <Wind /> },
];

const permitItems = [
    { id: 'autorisation-travail', label: 'Autorisation de Travail', icon: <FileText /> },
    { id: 'plan-consignation', label: 'Plan de Consignation', icon: <FileText /> },
    { id: 'espace-confine', label: 'Espace Confiné', icon: <Search /> },
    { id: 'travaux-hauteur', label: 'Travaux en Hauteur', icon: <Mountain /> },
    { id: 'permis-fouille', label: 'Permis de Fouille', icon: <Construction /> },
    { id: 'permis-de-feu', label: 'Permis de Feu', icon: <Flame /> },
];

const riskCategories = [
    { id: 'chimiques', label: 'Dangers Chimiques', icon: <Atom /> },
    { id: 'physiques', label: 'Dangers Physiques', icon: <Thermometer /> },
    { id: 'environnementaux', label: 'Dangers Environnementaux', icon: <Leaf /> },
    { id: 'biologiques', label: 'Dangers Biologiques', icon: <Biohazard /> },
    { id: 'ergonomiques', label: 'Dangers Ergonomiques', icon: <Bot /> },
    { id: 'autres', label: 'Autres Dangers', icon: <Drama /> },
];

// --- Sub-components ---

// Checkbox grid for EPI and Permits
const CheckboxGrid = ({ title, items, selectedItems, onSelectionChange, otherLabel, otherValue, onOtherValueChange }: any) => {
    
    const handleCheckedChange = (checked: boolean, itemId: string) => {
        const newSelection = checked 
            ? [...selectedItems, itemId] 
            : selectedItems.filter((id: string) => id !== itemId);
        onSelectionChange(newSelection);
    };

    return (
        <div className="space-y-4">
            <h4 className="font-medium">{title}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-2 p-2 rounded-md bg-slate-50 border">
                        <Checkbox 
                            id={item.id} 
                            checked={selectedItems.includes(item.label)}
                            onCheckedChange={(checked) => handleCheckedChange(!!checked, item.label)}
                        />
                        <Label htmlFor={item.id} className="flex items-center gap-2 cursor-pointer w-full">
                            <div className="text-primary">{item.icon}</div>
                            <span className="text-sm">{item.label}</span>
                        </Label>
                    </div>
                ))}
                 <div className="flex items-center space-x-2 p-2 rounded-md bg-slate-50 border">
                    <Checkbox 
                        id={`${title}-autre`} 
                        checked={selectedItems.includes(otherLabel)}
                        onCheckedChange={(checked) => handleCheckedChange(!!checked, otherLabel)}
                    />
                    <Label htmlFor={`${title}-autre`} className="flex items-center gap-2 cursor-pointer w-full">
                        <div className="text-primary"><Ban /></div>
                        <span className="text-sm">Autre</span>
                    </Label>
                </div>
            </div>
            {selectedItems.includes(otherLabel) && (
                <Input 
                    placeholder="Spécifiez autre..."
                    value={otherValue}
                    onChange={(e) => onOtherValueChange(e.target.value)}
                    className="mt-2"
                />
            )}
        </div>
    );
};

// Risks section with conditional inputs
const RisksSection = ({ risks, onRisksChange }: any) => {
    
    const handleRiskCheckedChange = (checked: boolean, categoryLabel: string) => {
        let newRisks;
        if (checked) {
            newRisks = [...risks, { category: categoryLabel, description: '' }];
        } else {
            newRisks = risks.filter((r: Risk) => r.category !== categoryLabel);
        }
        onRisksChange(newRisks);
    };

    const handleDescriptionChange = (description: string, categoryLabel: string) => {
        const newRisks = risks.map((r: Risk) => 
            r.category === categoryLabel ? { ...r, description } : r
        );
        onRisksChange(newRisks);
    };

    return (
        <div className="space-y-4">
             <h4 className="font-medium">Principaux Risques identifiés</h4>
             <div className="space-y-4">
                {riskCategories.map(category => {
                    const currentRisk = risks.find((r: Risk) => r.category === category.label);
                    const isChecked = !!currentRisk;
                    return (
                        <div key={category.id} className="p-3 rounded-md bg-slate-50 border">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={`risk-${category.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => handleRiskCheckedChange(!!checked, category.label)}
                                />
                                <Label htmlFor={`risk-${category.id}`} className="flex items-center gap-2 cursor-pointer w-full">
                                    <div className="text-destructive">{category.icon}</div>
                                    <span className="text-sm font-medium">{category.label}</span>
                                </Label>
                            </div>
                            {isChecked && (
                                <div className="mt-2 pl-8">
                                    <Textarea
                                        placeholder={`Détaillez le risque ${category.label.toLowerCase()}...`}
                                        value={currentRisk.description}
                                        onChange={(e) => handleDescriptionChange(e.target.value, category.label)}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
             </div>
        </div>
    )
};


// --- Main Component ---
interface WorkstationSafetyFormProps {
    initialEpi: string[];
    initialPermits: string[];
    initialRisks: Risk[];
    onEpiChange: (items: string[]) => void;
    onPermitsChange: (items: string[]) => void;
    onRisksChange: (items: Risk[]) => void;
}

export function WorkstationSafetyForm({
    initialEpi,
    initialPermits,
    initialRisks,
    onEpiChange,
    onPermitsChange,
    onRisksChange
}: WorkstationSafetyFormProps) {

    const OTHER_EPI_LABEL = 'Autre (EPI)';
    const OTHER_PERMIT_LABEL = 'Autre (Permis)';

    const [otherEpiValue, setOtherEpiValue] = useState('');
    const [otherPermitValue, setOtherPermitValue] = useState('');

    useEffect(() => {
        const otherEpi = initialEpi.find(item => !epiItems.some(predefined => predefined.label === item));
        if (otherEpi) {
            setOtherEpiValue(otherEpi);
        }
        const otherPermit = initialPermits.find(item => !permitItems.some(predefined => predefined.label === item));
        if (otherPermit) {
            setOtherPermitValue(otherPermit);
        }
    }, [initialEpi, initialPermits]);
    
    const handleEpiChange = (selection: string[]) => {
        let finalSelection = [...selection];
        const otherIndex = finalSelection.indexOf(OTHER_EPI_LABEL);
        
        if (otherIndex > -1) {
            finalSelection.splice(otherIndex, 1);
            if (otherEpiValue.trim()) {
                finalSelection.push(otherEpiValue.trim());
            }
        }
        onEpiChange(finalSelection);
    };
    
    const handlePermitChange = (selection: string[]) => {
        let finalSelection = [...selection];
        const otherIndex = finalSelection.indexOf(OTHER_PERMIT_LABEL);
        
        if (otherIndex > -1) {
            finalSelection.splice(otherIndex, 1);
            if (otherPermitValue.trim()) {
                finalSelection.push(otherPermitValue.trim());
            }
        }
        onPermitsChange(finalSelection);
    };

    useEffect(() => {
        handleEpiChange(initialEpi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otherEpiValue]);

    useEffect(() => {
        handlePermitChange(initialPermits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otherPermitValue]);
    

    return (
        <Card>
            <CardHeader>
                <CardTitle>Données de Sécurité</CardTitle>
                <CardDescription>Spécifiez les exigences de sécurité, les permis et les risques associés à ce poste.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <CheckboxGrid
                    title="Équipements de Protection Individuelle (EPI)"
                    items={epiItems}
                    selectedItems={initialEpi}
                    onSelectionChange={onEpiChange}
                    otherLabel={OTHER_EPI_LABEL}
                    otherValue={otherEpiValue}
                    onOtherValueChange={setOtherEpiValue}
                />
                <CheckboxGrid
                    title="Permis Spéciaux"
                    items={permitItems}
                    selectedItems={initialPermits}
                    onSelectionChange={onPermitsChange}
                    otherLabel={OTHER_PERMIT_LABEL}
                    otherValue={otherPermitValue}
                    onOtherValueChange={setOtherPermitValue}
                />
                <RisksSection
                    risks={initialRisks}
                    onRisksChange={onRisksChange}
                />
            </CardContent>
        </Card>
    );
}
