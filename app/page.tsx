'use client';

import { useState } from 'react';
import RoleSelection from '@/components/RoleSelection';
import InterviewInterface from '@/components/InterviewInterface';
import FeedbackDisplay from '@/components/FeedbackDisplay';
import { InterviewRole } from '@/lib/interviewAgent';

type AppState = 'role-selection' | 'interview' | 'feedback';

export default function Home() {
  const [state, setState] = useState<AppState>('role-selection');
  const [selectedRole, setSelectedRole] = useState<InterviewRole | null>(null);
  const [interviewData, setInterviewData] = useState<any>(null);

  const handleRoleSelect = (role: InterviewRole) => {
    setSelectedRole(role);
    setState('interview');
  };

  const handleInterviewComplete = (data: any) => {
    setInterviewData(data);
    setState('feedback');
  };

  const handleStartNew = () => {
    setState('role-selection');
    setSelectedRole(null);
    setInterviewData(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Interview Practice Partner
            </h1>
            <p className="text-gray-600">
              AI-powered mock interviews with real-time feedback
            </p>
          </header>

          {state === 'role-selection' && (
            <RoleSelection onSelectRole={handleRoleSelect} />
          )}

          {state === 'interview' && selectedRole && (
            <InterviewInterface
              role={selectedRole}
              onComplete={handleInterviewComplete}
              onCancel={() => setState('role-selection')}
            />
          )}

          {state === 'feedback' && interviewData && (
            <FeedbackDisplay
              feedback={interviewData}
              onStartNew={handleStartNew}
            />
          )}
        </div>
      </div>
    </main>
  );
}



