import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, PlusCircle } from 'lucide-react';
import { workstations } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function WorkstationsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Workstations">
        <Button asChild>
          <Link href="/workstations/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Workstation
          </Link>
        </Button>
      </PageHeader>
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Resources</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workstations.map((ws) => (
                  <TableRow key={ws.id}>
                    <TableCell className="font-medium">
                      <Link href={`/workstations/${ws.id}`} className="hover:underline">
                        {ws.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-sm truncate hidden md:table-cell">{ws.description}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex gap-1">
                        {ws.files && <Badge variant="secondary">{ws.files.length} Files</Badge>}
                        {ws.tableData && <Badge variant="secondary">{ws.tableData.length} Steps</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href={`/workstations/${ws.id}`}>View</Link></DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
