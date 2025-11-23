export type InterviewRole = 'sales' | 'engineer' | 'retail-associate';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'general';
  followUpPrompt?: string;
}

export interface InterviewResponse {
  questionId: string;
  answer: string;
  timestamp: number;
}

export interface InterviewFeedback {
  questionId: string;
  strengths: string[];
  improvements: string[];
  communicationScore: number;
  technicalScore?: number;
  overallScore: number;
  suggestions: string[];
}

export class InterviewAgent {
  private role: InterviewRole;
  private questions: InterviewQuestion[];
  private responses: InterviewResponse[] = [];
  private currentQuestionIndex: number = 0;
  private followUpCount: number = 0;
  private maxFollowUps: number = 2;

  constructor(role: InterviewRole) {
    this.role = role;
    this.questions = this.getRoleSpecificQuestions(role);
  }

  private getRoleSpecificQuestions(role: InterviewRole): InterviewQuestion[] {
    const baseQuestions: Record<InterviewRole, InterviewQuestion[]> = {
      'sales': [
        {
          id: 'sales-1',
          question: 'Tell me about yourself and why you\'re interested in sales.',
          category: 'general',
          followUpPrompt: 'Ask about their sales experience, achievements, or motivation.'
        },
        {
          id: 'sales-2',
          question: 'Describe a time when you had to handle a difficult customer. How did you resolve the situation?',
          category: 'behavioral',
          followUpPrompt: 'Ask about specific techniques, outcomes, or what they learned.'
        },
        {
          id: 'sales-3',
          question: 'How do you handle rejection in sales?',
          category: 'situational',
          followUpPrompt: 'Ask for examples or strategies they use to bounce back.'
        },
        {
          id: 'sales-4',
          question: 'Walk me through your sales process from initial contact to closing a deal.',
          category: 'technical',
          followUpPrompt: 'Ask about specific tools, metrics, or challenges in their process.'
        },
        {
          id: 'sales-5',
          question: 'How do you build rapport with potential clients?',
          category: 'behavioral',
          followUpPrompt: 'Ask for specific examples or techniques they use.'
        }
      ],
      'engineer': [
        {
          id: 'eng-1',
          question: 'Tell me about yourself and your technical background.',
          category: 'general',
          followUpPrompt: 'Ask about specific technologies, projects, or experience.'
        },
        {
          id: 'eng-2',
          question: 'Describe a challenging technical problem you solved. What was your approach?',
          category: 'technical',
          followUpPrompt: 'Ask about specific technologies used, debugging process, or lessons learned.'
        },
        {
          id: 'eng-3',
          question: 'How do you approach code reviews and collaboration with your team?',
          category: 'behavioral',
          followUpPrompt: 'Ask about specific practices, tools, or examples.'
        },
        {
          id: 'eng-4',
          question: 'Explain a technical concept you\'re passionate about to a non-technical person.',
          category: 'situational',
          followUpPrompt: 'Ask them to actually explain it or provide more details.'
        },
        {
          id: 'eng-5',
          question: 'How do you stay updated with the latest technologies and best practices?',
          category: 'general',
          followUpPrompt: 'Ask about specific resources, communities, or learning methods.'
        }
      ],
      'retail-associate': [
        {
          id: 'retail-1',
          question: 'Tell me about yourself and why you want to work in retail.',
          category: 'general',
          followUpPrompt: 'Ask about their interest in customer service or retail experience.'
        },
        {
          id: 'retail-2',
          question: 'Describe a time when you provided excellent customer service.',
          category: 'behavioral',
          followUpPrompt: 'Ask about specific details, customer reaction, or what made it excellent.'
        },
        {
          id: 'retail-3',
          question: 'How would you handle a situation where a customer is unhappy with a product?',
          category: 'situational',
          followUpPrompt: 'Ask about specific steps they would take or policies they\'d follow.'
        },
        {
          id: 'retail-4',
          question: 'How do you prioritize tasks when the store is busy?',
          category: 'situational',
          followUpPrompt: 'Ask for examples or specific strategies they use.'
        },
        {
          id: 'retail-5',
          question: 'What do you think makes a great retail associate?',
          category: 'general',
          followUpPrompt: 'Ask them to relate it to their own experience or skills.'
        }
      ]
    };

    return baseQuestions[role] || baseQuestions['sales'];
  }

  getCurrentQuestion(): InterviewQuestion | null {
    if (this.currentQuestionIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.currentQuestionIndex];
  }

  submitAnswer(answer: string): { nextQuestion: InterviewQuestion | null; isComplete: boolean } {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      return { nextQuestion: null, isComplete: true };
    }

    this.responses.push({
      questionId: currentQuestion.id,
      answer: answer.trim(),
      timestamp: Date.now()
    });

    // Check if we should ask a follow-up
    if (this.followUpCount < this.maxFollowUps && currentQuestion.followUpPrompt) {
      this.followUpCount++;
      // Return the same question with a follow-up indicator
      return { nextQuestion: currentQuestion, isComplete: false };
    }

    // Move to next question
    this.followUpCount = 0;
    this.currentQuestionIndex++;
    
    if (this.currentQuestionIndex >= this.questions.length) {
      return { nextQuestion: null, isComplete: true };
    }

    return { nextQuestion: this.questions[this.currentQuestionIndex], isComplete: false };
  }

  generateFollowUpQuestion(originalQuestion: InterviewQuestion, answer: string): string {
    // Simple follow-up generation based on the question's follow-up prompt
    if (!originalQuestion.followUpPrompt) {
      return 'Can you tell me more about that?';
    }

    // Generate contextual follow-ups
    const followUps: Record<string, string[]> = {
      'sales-2': [
        'What specific techniques did you use to de-escalate the situation?',
        'What was the outcome? Did you retain the customer?',
        'What did you learn from that experience?'
      ],
      'sales-4': [
        'What tools or CRM systems do you use in your sales process?',
        'How do you measure success at each stage?',
        'What\'s the biggest challenge you face in your sales process?'
      ],
      'eng-2': [
        'What specific technologies or tools did you use to solve it?',
        'How long did it take, and what was your debugging process?',
        'What would you do differently if you faced a similar problem?'
      ],
      'eng-3': [
        'What specific practices do you follow during code reviews?',
        'How do you handle disagreements about code quality?',
        'Can you give an example of feedback you gave or received?'
      ],
      'retail-2': [
        'What specific actions did you take that made the service excellent?',
        'How did the customer react?',
        'What did you learn from that experience?'
      ],
      'retail-3': [
        'What specific steps would you take in that situation?',
        'How would you ensure the customer leaves satisfied?',
        'What if the customer\'s request is outside store policy?'
      ]
    };

    const roleFollowUps = followUps[originalQuestion.id];
    if (roleFollowUps && roleFollowUps.length > 0) {
      const randomIndex = Math.floor(Math.random() * roleFollowUps.length);
      return roleFollowUps[randomIndex];
    }

    return originalQuestion.followUpPrompt;
  }

  getResponses(): InterviewResponse[] {
    return this.responses;
  }

  getCurrentQuestionIndex(): number {
    return this.currentQuestionIndex;
  }

  getTotalQuestions(): number {
    return this.questions.length;
  }

  getQuestions(): InterviewQuestion[] {
    return this.questions;
  }

  generateFeedback(response: InterviewResponse, question: InterviewQuestion): InterviewFeedback {
    const answer = response.answer.toLowerCase();
    const answerLength = response.answer.split(' ').length;
    
    // Analyze communication
    const hasStructure = answer.includes('first') || answer.includes('then') || 
                        answer.includes('finally') || answer.includes('because');
    const hasExamples = answer.includes('example') || answer.includes('time when') || 
                       answer.includes('situation where');
    const isDetailed = answerLength > 20;
    
    let communicationScore = 5;
    if (hasStructure) communicationScore += 1;
    if (hasExamples) communicationScore += 1;
    if (isDetailed) communicationScore += 1;
    if (answerLength < 10) communicationScore -= 2;
    
    communicationScore = Math.max(1, Math.min(10, communicationScore));

    // Technical score for technical questions
    let technicalScore: number | undefined;
    if (question.category === 'technical') {
      technicalScore = 5;
      const techKeywords = ['api', 'database', 'algorithm', 'code', 'system', 'framework', 
                           'language', 'tool', 'process', 'method'];
      const hasTechTerms = techKeywords.some(keyword => answer.includes(keyword));
      if (hasTechTerms) technicalScore += 2;
      if (isDetailed) technicalScore += 1;
      if (answerLength < 15) technicalScore -= 2;
      technicalScore = Math.max(1, Math.min(10, technicalScore));
    }

    const strengths: string[] = [];
    const improvements: string[] = [];
    const suggestions: string[] = [];

    if (hasStructure) {
      strengths.push('Well-structured response with clear organization');
    } else {
      improvements.push('Consider structuring your answer with clear points or steps');
      suggestions.push('Use phrases like "First, I...", "Then, I...", "Finally, I..." to organize your thoughts');
    }

    if (hasExamples) {
      strengths.push('Good use of specific examples');
    } else {
      improvements.push('Include specific examples or anecdotes');
      suggestions.push('Use the STAR method (Situation, Task, Action, Result) to structure behavioral questions');
    }

    if (isDetailed) {
      strengths.push('Detailed and comprehensive answer');
    } else {
      improvements.push('Provide more detail and context');
      suggestions.push('Aim for 2-3 sentences minimum, explaining the "why" behind your actions');
    }

    if (answerLength < 10) {
      improvements.push('Answer is too brief - expand on your thoughts');
      suggestions.push('Think about what the interviewer wants to know: the situation, your actions, and the outcome');
    }

    if (question.category === 'technical' && technicalScore && technicalScore < 7) {
      improvements.push('Could demonstrate deeper technical knowledge');
      suggestions.push('Include specific technologies, tools, or methodologies relevant to the role');
    }

    const overallScore = technicalScore 
      ? Math.round((communicationScore + technicalScore) / 2)
      : communicationScore;

    return {
      questionId: response.questionId,
      strengths: strengths.length > 0 ? strengths : ['Good effort in answering the question'],
      improvements,
      communicationScore,
      technicalScore,
      overallScore,
      suggestions: suggestions.length > 0 ? suggestions : ['Keep practicing and refining your answers']
    };
  }

  generateOverallFeedback(): {
    summary: string;
    averageScores: { communication: number; technical?: number; overall: number };
    keyStrengths: string[];
    keyImprovements: string[];
    recommendations: string[];
  } {
    const allFeedback: InterviewFeedback[] = [];
    
    this.responses.forEach(response => {
      const question = this.questions.find(q => q.id === response.questionId);
      if (question) {
        allFeedback.push(this.generateFeedback(response, question));
      }
    });

    const avgCommunication = allFeedback.reduce((sum, f) => sum + f.communicationScore, 0) / allFeedback.length;
    const technicalFeedbacks = allFeedback.filter(f => f.technicalScore !== undefined);
    const avgTechnical = technicalFeedbacks.length > 0
      ? technicalFeedbacks.reduce((sum, f) => sum + (f.technicalScore || 0), 0) / technicalFeedbacks.length
      : undefined;
    const avgOverall = allFeedback.reduce((sum, f) => sum + f.overallScore, 0) / allFeedback.length;

    const allStrengths = allFeedback.flatMap(f => f.strengths);
    const allImprovements = allFeedback.flatMap(f => f.improvements);
    const allSuggestions = allFeedback.flatMap(f => f.suggestions);

    // Get most common items
    const strengthCounts: Record<string, number> = {};
    allStrengths.forEach(s => strengthCounts[s] = (strengthCounts[s] || 0) + 1);
    const keyStrengths = Object.entries(strengthCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([strength]) => strength);

    const improvementCounts: Record<string, number> = {};
    allImprovements.forEach(i => improvementCounts[i] = (improvementCounts[i] || 0) + 1);
    const keyImprovements = Object.entries(improvementCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([improvement]) => improvement);

    const suggestionCounts: Record<string, number> = {};
    allSuggestions.forEach(s => suggestionCounts[s] = (suggestionCounts[s] || 0) + 1);
    const recommendations = Object.entries(suggestionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([suggestion]) => suggestion);

    let summary = `You completed the ${this.role} interview practice session. `;
    if (avgOverall >= 8) {
      summary += 'Excellent performance! You demonstrated strong communication skills';
    } else if (avgOverall >= 6) {
      summary += 'Good performance with room for improvement';
    } else {
      summary += 'There\'s significant room for improvement in your responses';
    }
    summary += '.';

    return {
      summary,
      averageScores: {
        communication: Math.round(avgCommunication * 10) / 10,
        technical: avgTechnical ? Math.round(avgTechnical * 10) / 10 : undefined,
        overall: Math.round(avgOverall * 10) / 10
      },
      keyStrengths,
      keyImprovements,
      recommendations
    };
  }

  reset(): void {
    this.currentQuestionIndex = 0;
    this.responses = [];
    this.followUpCount = 0;
  }
}

