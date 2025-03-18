'use client';

import { FormView } from '@/components/forms/form-view';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { formsApi } from '@/lib/api/forms';
import { toast } from 'sonner';

export default function FormSubmissionPage() {
  const params = useParams();
  const formId = Number(params.id);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForm = async () => {
      try {
        setLoading(true);
        const data = await formsApi.getForm(formId);
        setFormData(data);
      } catch (error) {
        toast.error('Failed to load form');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  const handleSubmit = async (data: any) => {
    try {
      toast.loading('Submitting your responses...');
      
      // Transform the data into the expected format
      const responses = Object.entries(data).map(([key, value]) => {
        const questionId = Number(key.replace('question_', ''));
        return {
          questionId,
          answer: Array.isArray(value) ? value.join(',') : String(value)
        };
      });
      
      await formsApi.submitResponse(formId, responses);
      toast.dismiss();
      toast.success('Form submitted successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to submit form');
      console.error(error);
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
      <FormView formData={formData} onSubmit={handleSubmit} />
    </div>
  );
} 