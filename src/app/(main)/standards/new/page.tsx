"use client";

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/components/file-upload';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NewStandardPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Standard Created",
      description: "The new standard has been successfully saved.",
    });
    setTimeout(() => router.push('/standards'), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <PageHeader title="Create New Standard">
        <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
            </Button>
            <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Standard
            </Button>
        </div>
      </PageHeader>
      
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Standard Details</CardTitle>
            <CardDescription>Provide details for the new operational standard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="std-name">Standard Name</Label>
                <Input id="std-name" placeholder="e.g., ISO 9001:2015" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="std-category">Category</Label>
                <Input id="std-category" placeholder="e.g., Quality Management" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="std-version">Version</Label>
              <Input id="std-version" placeholder="e.g., 2015" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="std-desc">Description</Label>
              <Textarea id="std-desc" placeholder="Describe the standard." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Attachments</CardTitle>
            <CardDescription>Upload relevant documentation or summary files.</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>
      </main>
    </form>
  );
}
