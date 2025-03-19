'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UpsertForm } from '@/components/forms/upsert-form';
import { toast } from 'sonner';
import { formsApi } from '@/lib/api/forms';

export default function EditFormPage() {
  const params = useParams();
  const formId = parseInt(params.id as string);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);

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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <div className='container py-6'>
    <UpsertForm formId={formId} initialData={formData} />
  </div>;
}
