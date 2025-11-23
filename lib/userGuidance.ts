import { InterviewQuestion } from './interviewAgent';

export interface GuidanceMessage {
  type: 'hint' | 'warning' | 'suggestion' | 'encouragement';
  message: string;
  icon: string;
}

export class UserGuidance {
  private questionHints: Map<string, string[]> = new Map();

  constructor() {
    this.initializeHints();
  }

  private initializeHints() {
    // Sales role hints
    this.questionHints.set('sales-1', [
      'Start with your background and relevant experience',
      'Mention why you\'re passionate about sales',
      'Keep it concise (1-2 minutes)'
    ]);
    this.questionHints.set('sales-2', [
      'Use the STAR method: Situation, Task, Action, Result',
      'Focus on how you resolved the conflict',
      'Highlight the positive outcome'
    ]);
    this.questionHints.set('sales-4', [
      'Walk through your sales funnel step by step',
      'Mention tools or techniques you use',
      'Include how you measure success'
    ]);

    // Engineer role hints
    this.questionHints.set('eng-1', [
      'Mention your technical background and education',
      'Highlight key technologies you work with',
      'Keep it professional and concise'
    ]);
    this.questionHints.set('eng-2', [
      'Explain the problem clearly',
      'Describe your approach and thought process',
      'Include the technologies/tools you used',
      'Mention the outcome and what you learned'
    ]);
    this.questionHints.set('eng-3', [
      'Focus on collaboration and communication',
      'Give examples of code review practices',
      'Mention how you handle feedback'
    ]);

    // Retail role hints
    this.questionHints.set('retail-1', [
      'Express enthusiasm for customer service',
      'Mention any relevant experience',
      'Show your people skills'
    ]);
    this.questionHints.set('retail-2', [
      'Use a specific example',
      'Describe what made the service excellent',
      'Include the customer\'s reaction'
    ]);
    this.questionHints.set('retail-3', [
      'Show empathy and understanding',
      'Describe your step-by-step approach',
      'Focus on finding a solution'
    ]);
  }

  getHintForQuestion(question: InterviewQuestion): GuidanceMessage[] {
    const hints = this.questionHints.get(question.id) || [];
    return hints.map(hint => ({
      type: 'hint' as const,
      message: hint,
      icon: '💡'
    }));
  }

  getGuidanceForConfusedUser(question: InterviewQuestion): GuidanceMessage {
    return {
      type: 'suggestion',
      message: `Not sure how to answer? Try starting with "Based on my experience..." or "I would approach this by..." Remember, there's no perfect answer - just be honest and thoughtful.`,
      icon: '🤔'
    };
  }

  getGuidanceForChattyUser(): GuidanceMessage {
    return {
      type: 'warning',
      message: 'Your answer is quite detailed! That\'s great, but try to stay focused on the question. Consider summarizing your key points.',
      icon: '💬'
    };
  }

  getGuidanceForEfficientUser(question: InterviewQuestion): GuidanceMessage {
    return {
      type: 'suggestion',
      message: 'Your answer is brief. Consider adding an example or explaining your reasoning to make it more compelling.',
      icon: '⚡'
    };
  }

  getEncouragement(): GuidanceMessage {
    const encouragements = [
      { message: 'Great job! Keep going!', icon: '👍' },
      { message: 'You\'re doing well!', icon: '✨' },
      { message: 'Nice answer!', icon: '👏' },
      { message: 'Good response!', icon: '🌟' }
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  getRedirectionMessage(question: InterviewQuestion): GuidanceMessage {
    return {
      type: 'suggestion',
      message: `Let's refocus on the question: "${question.question}". Try to relate your answer back to this topic.`,
      icon: '🎯'
    };
  }

  getEmptyInputGuidance(): GuidanceMessage {
    return {
      type: 'warning',
      message: 'Please provide an answer. Even a brief response is better than no response. You can say "I\'m not sure, but..." if you\'re uncertain.',
      icon: '⚠️'
    };
  }
}

