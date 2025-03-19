'use client';

import { FormView } from '@/components/forms/form-view';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { formsApi } from '@/lib/api/forms';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function FormSubmissionPage() {
  const params = useParams();
  const formId = Number(params.id);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userResponses, setUserResponses] = useState<any>({});

  useEffect(() => {
    const loadFormAndStatus = async () => {
      try {
        setLoading(true);
        // Load the form data
        const data = await formsApi.getForm(formId);
        setFormData(data);
        
        if (session?.user?.id) {
          // Check if user has already completed this form
          try {
            const assignedForms = await formsApi.getAssignedForms();
            const thisForm = assignedForms.find(form => form.id === formId);
            
            if (thisForm && thisForm.status === 'completed') {
              setIsCompleted(true);
              
              // Load user's previous responses
              const formSubmission = await formsApi.getResponse(formId, Number(session.user.id));

              if (formSubmission) {
                // Convert answers to form values format
                const formValues = formSubmission.answers.reduce((acc: any, answer: any) => {
                  // Use answer.questionId directly as the index since it matches the order
                  const answerKey = `question_${answer.questionId}`;
                  const question = formSubmission.questions[answer.questionId];
                  
                  if (question.type === 'yes_no') {
                    acc[answerKey] = answer.answer === 'Yes';
                  } else if (question.type === 'checkbox') {
                    acc[answerKey] = answer.answer ? answer.answer.split(',') : [];
                  } else {
                    acc[answerKey] = answer.answer;
                  }
                  return acc;
                }, {});
                
                setUserResponses(formValues);
              }
            }
          } catch (error) {
            console.error('Error checking form status:', error);
          }
        }
      } catch (error) {
        toast.error('Failed to load form');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadFormAndStatus();
    }
  }, [formId, session]);

  console.log('userResponses', userResponses);

  const handlePreSubmit = (data: any) => {
    if (isCompleted) return;
    
    setPendingSubmission(data);
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    if (!pendingSubmission || isCompleted) return;
    
    try {
      toast.loading('Submitting your responses...');
      
      // Transform the data into the expected format
      const responses = Object.entries(pendingSubmission).map(([key, value]) => {
        const questionId = Number(key.replace('question_', ''));
        let answer;
        
        // Handle different types of values
        if (typeof value === 'boolean') {
          // For yes_no questions
          answer = value ? 'Yes' : 'No';
        } else if (Array.isArray(value)) {
          // For checkbox questions
          answer = value.join(',');
        } else {
          // For text and multiple choice questions
          answer = String(value || '');
        }
        
        return {
          questionId,
          answer
        };
      });
      
      await formsApi.submitResponse(formId, responses);
      toast.dismiss();
      toast.success('Form submitted successfully');
      
      // Update status locally without refreshing
      setIsCompleted(true);
      setUserResponses(pendingSubmission);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to submit form');
      console.error(error);
    } finally {
      setShowConfirmation(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!formData) {
    return <div className="p-6">Form not found</div>;
  }

  return (
    <div className="container py-6">
      <FormView 
        formData={formData} 
        onSubmit={handlePreSubmit} 
        userRole={session?.user?.role || 'user'} 
        isCompleted={isCompleted}
        defaultValues={userResponses}
      />
      
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this form? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Submit Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 