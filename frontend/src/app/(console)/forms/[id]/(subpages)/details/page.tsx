'use client';

import { FormDetailView } from '@/components/forms/form-detail-view';
import { useParams } from 'next/navigation';

export default function FormDetailsPage() {
  const params = useParams();
  const formId = Number(params.id);

  return (
    <div className="h-[calc(100vh-4rem)] flex-1">
      <FormDetailView formId={formId} />
    </div>
  );
} 