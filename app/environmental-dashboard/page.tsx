import { Suspense } from 'react';
import EnvironmentalDashboard from '../components/EnvironmentalDashboard';

export default function EnvironmentalDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Environmental Dashboard</h1>
      <Suspense fallback={<div className="text-center py-10">Loading dashboard...</div>}>
        <EnvironmentalDashboard />
      </Suspense>
    </div>
  );
} 