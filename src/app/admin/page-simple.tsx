'use client';

import Header from '@/components/Header';
import TopicAdmin from '@/components/admin/TopicAdmin';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your quiz content, topics, and questions with AI-powered tools</p>
        </div>

        <TopicAdmin />
      </div>
    </div>
  );
}
