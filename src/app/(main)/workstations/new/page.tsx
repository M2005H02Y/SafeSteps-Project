"use client";

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DynamicTable from '@/components/dynamic-table';
import FileUpload from '@/components/file-upload';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NewWorkstationPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Workstation Created",
      description: "The new workstation has been successfully saved.",
    });
    setTimeout(() => router.push('/workstations'), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title="Create New Workstation">
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
            </Button>
            <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Workstation
            </Button>
        </div>
      </PageHeader>
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide a name and description for the new workstation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Workstation Name</Label>
              <Input id="ws-name" placeholder="e.g., Assembly Line Alpha" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-desc">Description</Label>
              <Textarea id="ws-desc" placeholder="Describe the purpose of this workstation." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Procedures Table</CardTitle>
            <CardDescription>Add steps, tasks, or any other structured data in a table format.</CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Attachments</CardTitle>
            <CardDescription>Upload relevant images, PDFs, or spreadsheets.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>
      </main>
    </form>
  );
}
