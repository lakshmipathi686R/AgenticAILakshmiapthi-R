'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { InterviewAgent, InterviewRole, InterviewResponse } from '@/lib/interviewAgent';
import { InputValidator } from '@/lib/inputValidator';
import { UserGuidance } from '@/lib/userGuidance';
import VoiceRecorder from './VoiceRecorder';
import ChatInput from './ChatInput';
import GuidancePanel from './GuidancePanel';

interface InterviewInterfaceProps {
  role: InterviewRole;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export default function InterviewInterface({ role, onComplete, onCancel }: InterviewInterfaceProps) {
  const [agent] = useState(() => new InterviewAgent(role));
  const [validator] = useState(() => new InputValidator());
  const [guidance] = useState(() => new UserGuidance());
  const [currentQuestion, setCurrentQuestion] = useState(agent.getCurrentQuestion());
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mode, setMode] = useState<'voice' | 'chat'>('voice');
  const [followUpText, setFollowUpText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [guidanceMessages, setGuidanceMessages] = useState<any[]>([]);
  const [userPersona, setUserPersona] = useState<'confused' | 'efficient' | 'chatty' | 'normal'>('normal');
  const [canSkip, setCanSkip] = useState(false);
  const questionRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    if (currentQuestion && mode === 'voice') {
      speakQuestion(currentQuestion.question);
    }
    // Reset guidance when question changes
    setGuidanceMessages([]);
    setValidationResult(null);
    setCanSkip(responses.length > 0); // Allow skip after first question
  }, [currentQuestion, mode]);

  // Keyboard shortcuts for efficient users
  useEffect(() => {
    const handleKeyPress = (e: globalThis.KeyboardEvent) => {
      // Ctrl/Cmd + H for hints
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHints(prev => !prev);
      }
      // Ctrl/Cmd + S to skip (if allowed)
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && canSkip) {
        e.preventDefault();
        handleSkip.current();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canSkip, isProcessing, agent, mode, onComplete]);

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
    if (isProcessing) return;

    // Validate input
    const validation = validator.validateInput(answer, currentQuestion?.question);
    setValidationResult(validation);

    // Detect user persona
    const persona = validator.detectUserPersona(answer, responses.length);
    setUserPersona(persona);

    // Handle invalid/empty inputs
    if (!validation.isValid) {
      const emptyGuidance = guidance.getEmptyInputGuidance();
      setGuidanceMessages([emptyGuidance]);
      setIsProcessing(false);
      return;
    }

    // Handle off-topic responses
    if (validation.isOffTopic) {
      const redirectMsg = guidance.getRedirectionMessage(currentQuestion!);
      setGuidanceMessages([redirectMsg, ...validation.warnings.map(w => ({
        type: 'warning',
        message: w,
        icon: '⚠️'
      }))]);
      // Still allow submission but with warning
    }

    // Handle chatty users
    if (persona === 'chatty' || validation.isTooLong) {
      const chattyGuidance = guidance.getGuidanceForChattyUser();
      setGuidanceMessages([chattyGuidance]);
      // Suggest extracting key points
      const keyPoints = validator.extractKeyPoints(answer);
      if (keyPoints !== answer) {
        setGuidanceMessages(prev => [...prev, {
          type: 'suggestion',
          message: `Consider focusing on: "${keyPoints}"`,
          icon: '💡'
        }]);
      }
    }

    // Handle confused users
    if (persona === 'confused') {
      const confusedGuidance = guidance.getGuidanceForConfusedUser(currentQuestion!);
      setGuidanceMessages([confusedGuidance]);
    }

    // Handle efficient users
    if (persona === 'efficient' && validation.isTooShort) {
      const efficientGuidance = guidance.getGuidanceForEfficientUser(currentQuestion!);
      setGuidanceMessages([efficientGuidance]);
    }

    // Show validation warnings
    if (validation.warnings.length > 0 && !validation.isOffTopic) {
      setGuidanceMessages(prev => [
        ...prev,
        ...validation.warnings.map(w => ({
          type: 'warning',
          message: w,
          icon: '⚠️'
        }))
      ]);
    }

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
      setGuidanceMessages([]); // Clear guidance for follow-up
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
      // Show encouragement occasionally
      if (Math.random() > 0.7) {
        const encouragement = guidance.getEncouragement();
        setGuidanceMessages([encouragement]);
        setTimeout(() => setGuidanceMessages([]), 3000);
      }
    }
    
    setIsProcessing(false);
    setValidationResult(null);
  };

  const handleFollowUpAnswer = (answer: string) => {
    handleAnswer(answer);
  };

  const handleSkip = useRef(() => {
    if (!canSkip || isProcessing) return;
    // Move to next question without answer
    const result = agent.submitAnswer('[Skipped]');
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
  });

  // Update skip handler when dependencies change
  useEffect(() => {
    handleSkip.current = () => {
      if (!canSkip || isProcessing) return;
      const result = agent.submitAnswer('[Skipped]');
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
    };
  }, [canSkip, isProcessing, agent, mode, onComplete]);

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

  const hints = guidance.getHintForQuestion(currentQuestion);

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
        <div className="flex gap-2">
          <button
            onClick={() => setShowHints(!showHints)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            title="Show hints (Ctrl+H)"
          >
            {showHints ? '🙈' : '💡'} {showHints ? 'Hide' : 'Show'} Hints
          </button>
          {canSkip && (
            <button
              onClick={() => handleSkip.current()}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Skip question (Ctrl+S)"
            >
              ⏭️ Skip
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
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

      {/* Hints Panel */}
      {showHints && hints.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            💡 Hints for this question:
          </h4>
          <ul className="space-y-1">
            {hints.map((hint, idx) => (
              <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                <span>•</span>
                <span>{hint.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Guidance Messages */}
      {guidanceMessages.length > 0 && (
        <GuidancePanel messages={guidanceMessages} onDismiss={() => setGuidanceMessages([])} />
      )}

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

      {/* Keyboard shortcuts hint for efficient users */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>💡 Tips: Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Ctrl+H</kbd> for hints, <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Ctrl+S</kbd> to skip</p>
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
