'use client';

import { InterviewRole } from '@/lib/interviewAgent';

interface RoleSelectionProps {
  onSelectRole: (role: InterviewRole) => void;
}

const roles: { id: InterviewRole; name: string; description: string; icon: string }[] = [
  {
    id: 'sales',
    name: 'Sales Representative',
    description: 'Practice sales interviews with questions about customer relationships, closing deals, and handling objections',
    icon: '💼'
  },
  {
    id: 'engineer',
    name: 'Software Engineer',
    description: 'Technical and behavioral questions covering problem-solving, collaboration, and technical expertise',
    icon: '💻'
  },
  {
    id: 'retail-associate',
    name: 'Retail Associate',
    description: 'Customer service scenarios, multitasking, and retail-specific situations',
    icon: '🛍️'
  }
];

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Select a Role to Practice
        </h2>
        <p className="text-gray-600">
          Choose the type of interview you'd like to practice
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-left border-2 border-transparent hover:border-primary-500 transform hover:-translate-y-1"
          >
            <div className="text-4xl mb-4">{role.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {role.name}
            </h3>
            <p className="text-gray-600 text-sm">
              {role.description}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> You can use voice input (recommended) or type your answers. 
          The AI will ask follow-up questions just like a real interviewer would.
        </p>
      </div>
    </div>
  );
}



