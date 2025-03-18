'use client';

import { Button } from '@/components/ui/button';
import { 
  Settings, 
  FileText, 
  Users, 
  BarChart,
  Download,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FormDetailSidebarProps {
  formId: number;
}

export function FormDetailSidebar({ formId }: FormDetailSidebarProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  const navItems = [
    {
      label: 'Form Details',
      href: `/forms/${formId}/details`,
      icon: FileText,
      active: pathname === `/forms/${formId}/details`
    },
    {
      label: 'Manage Assignees',
      href: `/forms/${formId}/assign`,
      icon: Users,
      active: pathname.includes('/assign')
    },
    {
      label: 'View Responses',
      href: `/forms/${formId}/responses`,
      icon: BarChart,
      active: pathname.includes('/responses')
    },
    // {
    //   label: 'Export Data',
    //   href: `/forms/${formId}/report`,
    //   icon: Download,
    //   active: pathname.includes('/report')
    // },
  ];

  return (
    <div className="w-64 border-r h-full p-4 bg-muted/10">
      <div className="mb-8">
        <Link href="/forms" className="flex items-center text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Forms
        </Link>
      </div>
      
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <Button
              variant={item.active ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      
      <div className="mt-8 pt-4 border-t">
        <Link href={`/forms/${formId}`} target="_blank">
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Preview Form
          </Button>
        </Link>
      </div>
    </div>
  );
} 