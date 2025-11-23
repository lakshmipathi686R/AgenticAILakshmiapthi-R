'use client';

interface GuidanceMessage {
  type: 'hint' | 'warning' | 'suggestion' | 'encouragement';
  message: string;
  icon: string;
}

interface GuidancePanelProps {
  messages: GuidanceMessage[];
  onDismiss: () => void;
}

export default function GuidancePanel({ messages, onDismiss }: GuidancePanelProps) {
  const getMessageStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'encouragement':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="mb-4 space-y-2">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-lg border ${getMessageStyles(msg.type)} flex items-start gap-2 animate-fade-in`}
        >
          <span className="text-lg">{msg.icon}</span>
          <div className="flex-1">
            <p className="text-sm">{msg.message}</p>
          </div>
          {messages.length > 1 && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 text-xs"
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      {messages.length === 1 && (
        <button
          onClick={onDismiss}
          className="text-xs text-gray-500 hover:text-gray-700 ml-auto block"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}

