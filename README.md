# Interview Practice Partner

An AI-powered interview practice application that helps users prepare for job interviews with voice and chat support.

## Features

- **Role-Specific Interviews**: Practice interviews for Sales, Engineering, and Retail Associate roles
- **Voice & Chat Modes**: Use voice input (recommended) or type your answers
- **Follow-up Questions**: The AI asks contextual follow-up questions like a real interviewer
- **Real-time Feedback**: Get detailed feedback on your responses including:
  - Communication skills assessment
  - Technical knowledge evaluation (for technical roles)
  - Strengths and areas for improvement
  - Actionable recommendations
- **Smart User Guidance**: Adapts to different user personas:
  - **Confused Users**: Provides hints, guidance, and encouragement
  - **Efficient Users**: Keyboard shortcuts (Ctrl+H for hints, Ctrl+S to skip)
  - **Chatty Users**: Topic detection and gentle redirection
  - **Edge Cases**: Handles invalid inputs, empty responses, and off-topic answers gracefully

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A modern browser with Web Speech API support (Chrome, Edge, or Safari) for voice features

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Select a Role**: Choose from Sales Representative, Software Engineer, or Retail Associate
2. **Choose Input Mode**: Select Voice (recommended) or Chat mode
3. **Answer Questions**: Respond to interview questions naturally
4. **Get Guidance**: Use hints (Ctrl+H) or let the system guide you if you're unsure
5. **Review Feedback**: After completing the interview, review your performance and areas for improvement

### Keyboard Shortcuts

- **Ctrl+H** (or Cmd+H on Mac): Toggle hints for current question
- **Ctrl+S** (or Cmd+S on Mac): Skip current question (available after first answer)
- **Enter**: Submit answer in chat mode
- **Shift+Enter**: New line in chat mode

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern styling
- **Web Speech API**: Voice recognition and synthesis

## Browser Compatibility

- **Voice Input**: Chrome, Edge, Safari (WebKit-based browsers)
- **Chat Mode**: All modern browsers

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── RoleSelection.tsx   # Role selection interface
│   ├── InterviewInterface.tsx  # Main interview UI
│   ├── VoiceRecorder.tsx   # Voice input component
│   ├── ChatInput.tsx       # Text input component
│   └── FeedbackDisplay.tsx # Feedback display
└── lib/
    └── interviewAgent.ts   # Interview logic and feedback generation
```

## Features in Detail

### Interview Agent

The `InterviewAgent` class handles:
- Role-specific question sets
- Follow-up question generation
- Response analysis and scoring
- Comprehensive feedback generation

### Voice Features

- Real-time speech-to-text transcription
- Text-to-speech for questions
- Visual feedback during recording

### Feedback System

Provides:
- Overall performance scores
- Communication assessment
- Technical knowledge evaluation (where applicable)
- Specific strengths and improvements
- Actionable recommendations

## User Persona Handling

The application intelligently adapts to different user behaviors:

### The Confused User
- Detects uncertainty ("I don't know", "I'm not sure")
- Provides contextual hints and guidance
- Offers encouragement to continue
- Handles empty or very brief inputs

### The Efficient User
- Supports keyboard shortcuts for quick navigation
- Allows skipping questions
- Accepts brief answers with suggestions for improvement
- Fast workflow optimized for quick results

### The Chatty User
- Detects off-topic responses
- Gently redirects to relevant topics
- Suggests key points extraction for long answers
- Handles multiple topics in single response

### Edge Cases
- Validates and handles invalid inputs
- Prevents duplicate submissions
- Handles browser compatibility issues
- Gracefully manages requests beyond capabilities


## Future Enhancements

- Integration with OpenAI API for more sophisticated question generation
- Additional interview roles
- Interview history and progress tracking
- Custom question sets
- Advanced topic detection using NLP

## License

MIT



