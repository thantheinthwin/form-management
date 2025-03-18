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

  useEffect(() => {
    const loadFormDetails = async () => {
      try {
        setLoading(true);
        const data = await formsApi.getForm(formId);
        setFormData(data);
        
        // For this example, let's assume getResponses returns assignees data as well
        // In a real implementation, you might need a separate API call
        const responseData = await formsApi.getResponses(formId);
        setAssignees(responseData?.assignees || []);
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
      {/* Sidebar */}
      <FormDetailSidebar formId={formId} formTitle={formData.title} />

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          {/* Form Fields Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-xl">Form Configuration</CardTitle>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {formData.questions && formData.questions.map((field: FormField) => (
                  <div key={field.id} className="flex justify-between border-b pb-3">
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
              <Button variant="outline" size="sm">
                Assign Users
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {assignees.length > 0 ? (
                  assignees.map((assignee) => (
                    <div key={assignee.id} className="flex justify-between items-center border-b pb-3">
                      <div className="flex items-center space-x-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{assignee.name}</span>
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