'use client';

import Header from '@/components/Header';
import VocabularyImageUpdater from '@/components/admin/VocabularyImageUpdater';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function VocabularyImagesPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'teacher']}>
      <div className="flex flex-col h-full min-h-screen">
        <Header />
        <div className="flex-grow p-4 sm:p-6 container mx-auto max-w-4xl pt-20">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Vocabulary Image Management</h1>
            <p className="text-gray-600 mt-2">
              Automatically find and assign child-appropriate images to vocabulary words using Google Images.
            </p>
          </div>
          <VocabularyImageUpdater />
        </div>
      </div>
    </ProtectedRoute>
  );
}
