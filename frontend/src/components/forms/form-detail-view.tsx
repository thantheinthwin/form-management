'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  UserCircle,
  CheckCircle,
  Clock 
} from 'lucide-react';
import { formsApi } from '@/lib/api/forms';
import { toast } from 'sonner';
import { FormDetailSidebar } from './form-detail-sidebar';
import { useRouter } from 'next/navigation';

interface FormField {
  id: number;
  text: string;
  type: string;
  options?: string[];
  required: boolean;
}

interface Assignee {
  id: number;
  name: string;
  email: string;
  status: 'completed' | 'pending';
  submittedAt?: string;
}

interface FormDetailsProps {
  formId: number;
}

export function FormDetailView({ formId }: FormDetailsProps) {
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignees, setAssignees] = useState<Assignee[]>([]);

  const router = useRouter();

  useEffect(() => {
    const loadFormDetails = async () => {
      try {
        setLoading(true);
        const data = await formsApi.getForm(formId);
        console.log('form data', data);
        setFormData(data);
        
        const responseData = await formsApi.getResponses(formId);
        console.log('response data', responseData);
        setAssignees(responseData?.responses || []);
      } catch (error) {
        toast.error('Failed to load form details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadFormDetails();
  }, [formId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!formData) {
    return <div>Form not found</div>;
  }

  const getFieldTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'text': 'Text Input',
      'multiple_choice': 'Multiple Choice',
      'checkbox': 'Checkbox',
      'yes_no': 'Yes/No'
    };
    
    return typeMap[type] || type;
  };

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="p-6 flex-1">
        <div className="space-y-6">
          {/* Form Fields Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className='flex justify-between w-full'>
                <div className='grid gap-4'>
                <h1 className="text-2xl font-bold">{formData.title}</h1>
                <p className="text-sm text-muted-foreground">{formData.description}</p>
                </div>
                <div>
                  <h2 className='text-sm text-muted-foreground'>Created at: {new Date(formData.createdAt).toLocaleDateString('en-GB')}</h2>
                </div>
              </CardTitle>
              {/* <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button> */}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.questions && formData.questions.map((field: FormField, index: number) => (
                  <div key={index} className="flex justify-between border-b pb-3">
                    <div className="font-medium">{field.text}</div>
                    <div className="text-muted-foreground">{getFieldTypeName(field.type)}</div>
                  </div>
                ))}
                {(!formData.questions || formData.questions.length === 0) && (
                  <>
                    <div className="flex justify-between border-b pb-3">
                      <div className="font-medium">Field Name</div>
                      <div className="text-muted-foreground">Field Type</div>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <div className="font-medium">Field Name</div>
                      <div className="text-muted-foreground">Field Type</div>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <div className="font-medium">Field Name</div>
                      <div className="text-muted-foreground">Field Type</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignees Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-xl">Assignee</CardTitle>
              <Button variant="outline" size="sm" onClick={() => {
                router.push(`/forms/${formId}/responses`);
              }}>
                Assign Users
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {assignees.length > 0 ? (
                  assignees.map((assignee, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-3">
                      <div className="flex items-center space-x-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <span>{assignee.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        {assignee.status === 'completed' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-500">Completed</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-amber-500 mr-1" />
                            <span className="text-amber-500">Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No assignees found. Assign users to this form to collect responses.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 