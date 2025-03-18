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
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formsApi, Form } from '@/lib/api/forms';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function UserFormList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedForms();
  }, []);

  const loadAssignedForms = async () => {
    try {
      setLoading(true);
      const data = await formsApi.getAssignedForms();
      setForms(data);
    } catch (error) {
      toast.error('Failed to load assigned forms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Forms</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{form.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Assigned by {form.createdBy}
                  </CardDescription>
                </div>
                <Badge variant={form.status === 'completed' ? 'success' : 'default'}>
                  {form.status === 'completed' ? 'Completed' : 'Pending'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {form.description || 'No description provided'}
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/forms/${form.id}`} className="w-full">
                <Button 
                  variant={form.status === 'completed' ? 'outline' : 'default'} 
                  className="w-full"
                >
                  {form.status === 'completed' ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      View Submission
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Complete Form
                    </>
                  )}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}

        {forms.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No forms assigned to you</h3>
            <p className="text-sm text-muted-foreground mt-1">
              When an administrator assigns forms to you, they will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 