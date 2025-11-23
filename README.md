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
4. **Review Feedback**: After completing the interview, review your performance and areas for improvement

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

## Future Enhancements

- Integration with OpenAI API for more sophisticated question generation
- Additional interview roles
- Practice mode with hints
- Interview history and progress tracking
- Custom question sets

## License

MIT



