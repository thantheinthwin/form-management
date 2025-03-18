'use client';

import { FormList } from '@/components/forms/form-list';
import { UserFormList } from '@/components/forms/user-form-list';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function FormsPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    // Check if user is admin based on role
    setIsAdmin(session?.user?.role === 'admin');
    setLoading(false);
  }, [session, status]);

  if (status === 'loading' || loading) {
    return <div className="container py-6">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    // Handle unauthenticated state or redirect
    return <div className="container py-6">Please log in to view forms</div>;
  }

  return (
    <div className="container py-6">
      {isAdmin ? <FormList /> : <UserFormList />}
    </div>
  );
} 