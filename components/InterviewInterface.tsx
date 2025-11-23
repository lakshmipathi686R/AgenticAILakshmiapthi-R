'use client';

import { useState, useEffect, useRef } from 'react';
import { InterviewAgent, InterviewRole, InterviewResponse } from '@/lib/interviewAgent';
import VoiceRecorder from './VoiceRecorder';
import ChatInput from './ChatInput';

interface InterviewInterfaceProps {
  role: InterviewRole;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export default function InterviewInterface({ role, onComplete, onCancel }: InterviewInterfaceProps) {
  const [agent] = useState(() => new InterviewAgent(role));
  const [currentQuestion, setCurrentQuestion] = useState(agent.getCurrentQuestion());
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<'voice' | 'chat'>('voice');
  const [followUpText, setFollowUpText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const questionRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    if (currentQuestion && mode === 'voice') {
      speakQuestion(currentQuestion.question);
    }
  }, [currentQuestion, mode]);

  const speakQuestion = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      synthRef.current.speak(utterance);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!answer.trim() || isProcessing) return;

    setIsProcessing(true);
    
    // Submit answer to agent
    const result = agent.submitAnswer(answer);
    
    const newResponse: InterviewResponse = {
      questionId: currentQuestion!.id,
      answer: answer.trim(),
      timestamp: Date.now()
    };
    setResponses([...responses, newResponse]);
    
    // Check if agent wants to ask a follow-up (returns same question)
    if (result.nextQuestion && result.nextQuestion.id === currentQuestion!.id && !result.isComplete) {
      // Generate and show follow-up question
      const followUp = agent.generateFollowUpQuestion(currentQuestion!, answer);
      setFollowUpText(followUp);
      if (mode === 'voice') {
        setTimeout(() => speakQuestion(followUp), 500);
      }
      setIsProcessing(false);
      return;
    }
    
    if (result.isComplete) {
      setIsComplete(true);
      const overallFeedback = agent.generateOverallFeedback();
      const allFeedback = agent.getResponses().map(r => {
        const q = agent.getQuestions().find((q) => q.id === r.questionId);
        return q ? agent.generateFeedback(r, q) : null;
      }).filter(Boolean);
      
      onComplete({
        feedback: overallFeedback,
        detailedFeedback: allFeedback,
        responses: agent.getResponses()
      });
    } else {
      setCurrentQuestion(result.nextQuestion);
      setFollowUpText(null);
      if (result.nextQuestion && mode === 'voice') {
        setTimeout(() => speakQuestion(result.nextQuestion!.question), 500);
      }
    }
    
    setIsProcessing(false);
  };

  const handleFollowUpAnswer = (answer: string) => {
    handleAnswer(answer);
  };

  if (isComplete) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Generating your feedback...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')} Interview
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Question {agent.getCurrentQuestionIndex() + 1} of {agent.getTotalQuestions()}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('voice')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'voice'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎤 Voice
          </button>
          <button
            onClick={() => setMode('chat')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'chat'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💬 Chat
          </button>
        </div>
      </div>

      <div
        ref={questionRef}
        className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border-l-4 border-primary-500"
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">❓</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {followUpText || currentQuestion.question}
            </h3>
            {followUpText && (
              <p className="text-sm text-gray-600 italic">
                (Follow-up question)
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mode === 'voice' ? (
          <VoiceRecorder
            onTranscript={followUpText ? handleFollowUpAnswer : handleAnswer}
            isListening={isListening}
            onListeningChange={setIsListening}
            disabled={isProcessing}
          />
        ) : (
          <ChatInput
            onSubmit={followUpText ? handleFollowUpAnswer : handleAnswer}
            disabled={isProcessing}
            placeholder={followUpText ? "Answer the follow-up question..." : "Type your answer here..."}
          />
        )}
      </div>

      {responses.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Your Answers:</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {responses.map((response, idx) => (
              <div key={idx} className="text-sm p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{response.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

