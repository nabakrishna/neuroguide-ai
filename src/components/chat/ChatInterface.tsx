import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Brain, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  conversationId?: string;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const { messages, isLoading, streamingContent, sendMessage } = useChat({
    conversationId,
    onError: (error) => console.error('Chat error:', error),
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);

  const suggestions = [
    "What's the best architecture for image classification?",
    "Audit my dataset for class imbalance",
    "Find recent papers on transformer optimization",
    "Generate code for a PyTorch training loop",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {showWelcome && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="p-4 rounded-2xl bg-gradient-hero mb-6">
                <Brain className="w-12 h-12 text-neuro-blue" />
              </div>
              <h1 className="text-2xl font-bold mb-2">How can I help you today?</h1>
              <p className="text-muted-foreground mb-8 max-w-md">
                I'm your AI research companion. Ask me about ML architectures, 
                data auditing, research papers, or code generation.
              </p>
              
              {/* Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(suggestion)}
                    className="p-4 text-left text-sm rounded-xl border border-border bg-card hover:bg-muted hover:border-muted-foreground/20 transition-all duration-200 group"
                  >
                    <Sparkles className="w-4 h-4 text-neuro-blue mb-2 group-hover:scale-110 transition-transform" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {/* Streaming message */}
              {isLoading && streamingContent && (
                <ChatMessage
                  message={{
                    id: 'streaming',
                    conversation_id: '',
                    role: 'assistant',
                    content: streamingContent,
                    metadata: {},
                    created_at: new Date().toISOString(),
                  }}
                  isStreaming
                />
              )}
              
              {/* Loading indicator */}
              {isLoading && !streamingContent && (
                <div className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="typing-indicator flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
