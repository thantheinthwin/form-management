'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, FileText, Users, Download } from 'lucide-react';
import { formsApi, Form } from '@/lib/api/forms';
import { toast } from 'sonner';

export function FormList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const data = await formsApi.getForms();
      setForms(data);
    } catch (error) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await formsApi.deleteForm(id);
      setForms(forms.filter((form) => form.id !== id));
      toast.success('Form deleted successfully');
    } catch (error) {
      toast.error('Failed to delete form');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Forms</h1>
        <Link href="/forms/create" passHref>
          <Button>Create New Form</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{form.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Created by {form.createdBy}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href={`/forms/${form.id}`} className="flex items-center w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/forms/${form.id}/assign`} className="flex items-center w-full">
                        <Users className="mr-2 h-4 w-4" />
                        Assign Users
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/forms/${form.id}/report`} className="flex items-center w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(form.id)}
                    >
                      <button className="flex items-center w-full text-destructive">
                        <FileText className="mr-2 h-4 w-4" />
                        Delete Form
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {form.description || 'No description provided'}
              </p>
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-1">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Responses</span>
                  <span>
                    {form.completedAssignments} / {form.totalAssignments}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(form.completedAssignments / form.totalAssignments) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}

        {forms.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No forms yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first form to get started
            </p>
            <Link href="/forms/create" passHref>
              <Button className="mt-4">Create Form</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 