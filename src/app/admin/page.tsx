'use client';

import Header from '@/components/Header';
import TopicManagement from '@/components/admin/TopicManagement';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'teacher']}>
      <div className="flex flex-col h-full min-h-screen">
        <Header />
        <div className="flex-grow p-4 sm:p-6 container mx-auto max-w-7xl pt-36">
          <TopicManagement />
        </div>
      </div>
    </ProtectedRoute>
  );
}
