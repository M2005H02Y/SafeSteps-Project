"use client";

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FileUpload from '@/components/file-upload';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NewFormPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Form Created",
      description: "The new form has been successfully saved.",
    });
    setTimeout(() => router.push('/forms'), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title="Create New Form">
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
            </Button>
            <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Form
            </Button>
        </div>
      </PageHeader>
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
            <CardDescription>Provide details for the new form.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-name">Form Name</Label>
                <Input id="form-name" placeholder="e.g., Daily Equipment Checklist" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-type">Form Type</Label>
                <Input id="form-type" placeholder="e.g., Safety" required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Form File</CardTitle>
            <CardDescription>Upload the primary file for this form (e.g., PDF, Excel). The first PDF uploaded will be used for the preview.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>
      </main>
    </form>
  );
}
