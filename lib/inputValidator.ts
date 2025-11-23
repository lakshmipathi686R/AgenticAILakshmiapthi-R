export interface ValidationResult {
  isValid: boolean;
  isTooShort: boolean;
  isTooLong: boolean;
  isOffTopic: boolean;
  isEmpty: boolean;
  containsInvalidChars: boolean;
  warnings: string[];
  suggestions: string[];
}

export class InputValidator {
  private readonly MIN_LENGTH = 3;
  private readonly MAX_LENGTH = 2000;
  private readonly OFF_TOPIC_KEYWORDS = [
    'weather', 'sports', 'politics', 'movie', 'music', 'food', 'travel',
    'vacation', 'hobby', 'game', 'tv show', 'netflix', 'youtube'
  ];
  private readonly QUESTION_KEYWORDS = [
    'what is', 'how do', 'can you', 'will you', 'why', 'when', 'where',
    'tell me about', 'explain', 'help me', 'i don\'t know', 'i\'m not sure'
  ];

  validateInput(input: string, currentQuestion?: string): ValidationResult {
    const trimmed = input.trim();
    const result: ValidationResult = {
      isValid: true,
      isTooShort: false,
      isTooLong: false,
      isOffTopic: false,
      isEmpty: false,
      containsInvalidChars: false,
      warnings: [],
      suggestions: []
    };

    // Check if empty
    if (!trimmed) {
      result.isValid = false;
      result.isEmpty = true;
      result.warnings.push('Your answer is empty. Please provide a response.');
      result.suggestions.push('Try to answer the question asked, even if briefly.');
      return result;
    }

    // Check length
    if (trimmed.length < this.MIN_LENGTH) {
      result.isTooShort = true;
      result.warnings.push('Your answer seems very brief. Consider providing more detail.');
      result.suggestions.push('Try to explain your answer with 2-3 sentences or an example.');
    }

    if (trimmed.length > this.MAX_LENGTH) {
      result.isTooLong = true;
      result.warnings.push('Your answer is quite long. Consider being more concise.');
      result.suggestions.push('Focus on the key points relevant to the question.');
    }

    // Check for off-topic content
    const lowerInput = trimmed.toLowerCase();
    const hasOffTopicKeywords = this.OFF_TOPIC_KEYWORDS.some(keyword => 
      lowerInput.includes(keyword)
    );
    
    if (hasOffTopicKeywords && !this.isContextuallyRelevant(lowerInput, currentQuestion)) {
      result.isOffTopic = true;
      result.warnings.push('Your answer might be going off-topic. Try to stay focused on the interview question.');
      result.suggestions.push('Refocus on the question asked and provide a relevant example or explanation.');
    }

    // Check if user is asking questions instead of answering
    const isAskingQuestion = this.QUESTION_KEYWORDS.some(keyword => 
      lowerInput.startsWith(keyword) || lowerInput.includes('? ' + keyword)
    );
    
    if (isAskingQuestion) {
      result.warnings.push('It seems you\'re asking a question. Please try to answer the interviewer\'s question instead.');
      result.suggestions.push('If you\'re unsure, you can say "I\'m not entirely sure, but based on my experience..."');
    }

    // Check for invalid characters (excessive special chars)
    const specialCharCount = (trimmed.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    if (specialCharCount > trimmed.length * 0.3) {
      result.containsInvalidChars = true;
      result.warnings.push('Your answer contains many special characters. Please use normal text.');
    }

    // Overall validity
    if (result.isEmpty || (result.isOffTopic && trimmed.length < 20)) {
      result.isValid = false;
    }

    return result;
  }

  private isContextuallyRelevant(input: string, currentQuestion?: string): boolean {
    if (!currentQuestion) return false;
    
    // Check if off-topic keyword appears in a relevant context
    const questionLower = currentQuestion.toLowerCase();
    const relevantContexts = [
      'customer', 'client', 'team', 'project', 'work', 'job', 'experience',
      'situation', 'challenge', 'problem', 'solution', 'result'
    ];
    
    return relevantContexts.some(context => 
      input.includes(context) || questionLower.includes(context)
    );
  }

  detectUserPersona(input: string, responseHistory: number): 'confused' | 'efficient' | 'chatty' | 'normal' {
    const lowerInput = input.toLowerCase();
    
    // Confused user indicators
    if (lowerInput.includes('i don\'t know') || 
        lowerInput.includes('i\'m not sure') ||
        lowerInput.includes('not sure') ||
        lowerInput.includes('unsure') ||
        lowerInput.includes('confused') ||
        lowerInput.includes('help') ||
        lowerInput.length < 10) {
      return 'confused';
    }
    
    // Efficient user indicators (very brief, direct answers)
    if (input.length < 30 && 
        !lowerInput.includes('because') && 
        !lowerInput.includes('example') &&
        responseHistory > 0) {
      return 'efficient';
    }
    
    // Chatty user indicators (very long, multiple topics)
    if (input.length > 500 || 
        (input.split('.').length > 5 && input.length > 200)) {
      return 'chatty';
    }
    
    return 'normal';
  }

  extractKeyPoints(input: string): string {
    // Simple extraction - take first 2-3 sentences
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 3) {
      return input;
    }
    return sentences.slice(0, 3).join('. ') + '.';
  }
}

