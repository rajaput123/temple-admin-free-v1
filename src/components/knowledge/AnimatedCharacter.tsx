import { useEffect, useState } from 'react';
import { MessageSquare, Mic, MicOff } from 'lucide-react';

interface AnimatedCharacterProps {
  isSpeaking?: boolean;
  isListening?: boolean;
}

export function AnimatedCharacter({ isSpeaking = false, isListening = false }: AnimatedCharacterProps) {
  const [animation, setAnimation] = useState<'idle' | 'speaking' | 'listening'>('idle');

  useEffect(() => {
    if (isSpeaking) {
      setAnimation('speaking');
    } else if (isListening) {
      setAnimation('listening');
    } else {
      setAnimation('idle');
    }
  }, [isSpeaking, isListening]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Animated Character Avatar */}
      <div className="relative w-32 h-32 mb-4">
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center transition-all duration-300 ${
            animation === 'speaking' ? 'animate-pulse scale-110' : animation === 'listening' ? 'animate-bounce scale-105' : ''
          }`}
        >
          <div className="relative">
            <MessageSquare className="h-16 w-16 text-primary" />
            {isListening && (
              <div className="absolute -top-2 -right-2">
                <Mic className="h-6 w-6 text-green-500 animate-pulse" />
              </div>
            )}
            {isSpeaking && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1 h-6 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Ripple effect when speaking */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </div>

      {/* Status Text */}
      <div className="text-sm text-muted-foreground">
        {isListening && <span className="text-green-600 dark:text-green-400">Listening...</span>}
        {isSpeaking && <span className="text-primary">Speaking...</span>}
        {!isListening && !isSpeaking && <span>Ready to chat</span>}
      </div>
    </div>
  );
}
