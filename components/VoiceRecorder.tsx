'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({
  onTranscript,
  isListening,
  onListeningChange,
  disabled = false
}: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        onListeningChange(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
          setTranscript('');
          recognition.stop();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onListeningChange(false);
        if (event.error === 'no-speech') {
          setTranscript('');
        }
      };

      recognition.onend = () => {
        onListeningChange(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, onListeningChange]);

  const startListening = () => {
    if (recognitionRef.current && !disabled) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari for voice input.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center text-2xl
            transition-all duration-300 transform
            ${isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110'
              : 'bg-primary-600 hover:bg-primary-700 hover:scale-105'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg'}
          `}
          title={isListening ? 'Stop recording' : 'Start recording'}
        >
          {isListening ? '⏹️' : '🎤'}
        </button>
      </div>

      {isListening && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Listening...</p>
          <div className="flex justify-center gap-1">
            <div className="w-2 h-8 bg-primary-400 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-8 bg-primary-400 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-8 bg-primary-400 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {transcript && !isListening && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}

      <p className="text-xs text-center text-gray-500">
        {isListening
          ? 'Speak your answer now...'
          : 'Click the microphone to start recording your answer'}
      </p>
    </div>
  );
}



