'use client';

import { InterviewFeedback } from '@/lib/interviewAgent';

interface FeedbackDisplayProps {
  feedback: {
    feedback: {
      summary: string;
      averageScores: { communication: number; technical?: number; overall: number };
      keyStrengths: string[];
      keyImprovements: string[];
      recommendations: string[];
    };
    detailedFeedback: (InterviewFeedback | null)[];
    responses: any[];
  };
  onStartNew: () => void;
}

export default function FeedbackDisplay({ feedback, onStartNew }: FeedbackDisplayProps) {
  const { feedback: overallFeedback, detailedFeedback } = feedback;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Feedback</h2>
        <p className="text-gray-600">Review your performance and areas for improvement</p>
      </div>

      {/* Overall Summary */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Overall Summary</h3>
        <p className="text-gray-700 mb-4">{overallFeedback.summary}</p>
        
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className={`p-4 rounded-lg ${getScoreColor(overallFeedback.averageScores.communication)}`}>
            <div className="text-sm font-medium mb-1">Communication</div>
            <div className="text-2xl font-bold">{overallFeedback.averageScores.communication.toFixed(1)}</div>
            <div className="text-xs mt-1">{getScoreLabel(overallFeedback.averageScores.communication)}</div>
          </div>
          {overallFeedback.averageScores.technical && (
            <div className={`p-4 rounded-lg ${getScoreColor(overallFeedback.averageScores.technical)}`}>
              <div className="text-sm font-medium mb-1">Technical</div>
              <div className="text-2xl font-bold">{overallFeedback.averageScores.technical.toFixed(1)}</div>
              <div className="text-xs mt-1">{getScoreLabel(overallFeedback.averageScores.technical)}</div>
            </div>
          )}
          <div className={`p-4 rounded-lg ${getScoreColor(overallFeedback.averageScores.overall)}`}>
            <div className="text-sm font-medium mb-1">Overall</div>
            <div className="text-2xl font-bold">{overallFeedback.averageScores.overall.toFixed(1)}</div>
            <div className="text-xs mt-1">{getScoreLabel(overallFeedback.averageScores.overall)}</div>
          </div>
        </div>
      </div>

      {/* Key Strengths */}
      {overallFeedback.keyStrengths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">✅</span> Key Strengths
          </h3>
          <ul className="space-y-2">
            {overallFeedback.keyStrengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600 mt-0.5">•</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {overallFeedback.keyImprovements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">📈</span> Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {overallFeedback.keyImprovements.map((improvement, idx) => (
              <li key={idx} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span className="text-gray-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {overallFeedback.recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span> Recommendations
          </h3>
          <ul className="space-y-2">
            {overallFeedback.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-600 mt-0.5">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Feedback */}
      {detailedFeedback.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Question-by-Question Feedback</h3>
          <div className="space-y-4">
            {detailedFeedback.map((fb, idx) => {
              if (!fb) return null;
              return (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Question {idx + 1}</span>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreColor(fb.overallScore)}`}>
                      Score: {fb.overallScore}/10
                    </div>
                  </div>
                  
                  {fb.strengths.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-green-700">Strengths: </span>
                      <span className="text-xs text-gray-600">{fb.strengths.join(', ')}</span>
                    </div>
                  )}
                  
                  {fb.improvements.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-yellow-700">Improvements: </span>
                      <span className="text-xs text-gray-600">{fb.improvements.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onStartNew}
          className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Start New Interview
        </button>
      </div>
    </div>
  );
}



