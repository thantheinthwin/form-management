'use client';

import { FormDetailSidebar } from "@/components/forms/form-detail-sidebar";
import { useParams } from "next/navigation";

export default function FormLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const formId = Number(params.id);
  return (
    <div className="flex h-full">
      <FormDetailSidebar formId={formId} />
      {children}
    </div>
  );
}
