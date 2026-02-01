import { Suspense } from 'react';
import SharePageContent from './SharePageContent';

// Wrapper component that handles the Suspense boundary
export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🏆</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading Achievement...</h1>
            <p className="text-gray-600">Please wait while we load your achievement</p>
          </div>
        </div>
      </div>
    }>
      <SharePageContent />
    </Suspense>
  );
}