
import React from 'react';
import { AuthContainer } from '@/components/auth/AuthContainer';
import { useAuth } from '@/hooks/use-auth';
import { Dashboard } from '@/components/layout/Dashboard';
import { Sidebar } from '@/components/layout/Sidebar';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthContainer />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto pl-64">
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
