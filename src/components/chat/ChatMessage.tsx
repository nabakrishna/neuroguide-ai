import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Brain, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-4 animate-fade-in',
        isUser ? 'flex-row-reverse' : ''
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          isUser ? 'bg-neuro-blue' : 'bg-primary'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Brain className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'flex-1 max-w-[85%] px-4 py-3 rounded-xl',
          isUser
            ? 'chat-message-user'
            : 'chat-message-assistant'
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                
                if (isInline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="code-block my-3 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
                      <span className="text-xs text-muted-foreground">{match[1]}</span>
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-4 mb-2">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-4 mb-2">{children}</ol>;
              },
              li({ children }) {
                return <li className="mb-1">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-semibold mt-3 mb-2">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-semibold mt-2 mb-1">{children}</h3>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-neuro-blue ml-1 pulse-dot" />
        )}
      </div>
    </div>
  );
}
