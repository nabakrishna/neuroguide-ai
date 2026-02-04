import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex items-end gap-2 p-3 rounded-xl border border-border bg-card shadow-card">
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 text-muted-foreground"
        disabled
      >
        <Paperclip className="w-5 h-5" />
      </Button>
      
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about ML architectures, data issues, or research papers..."
        className={cn(
          'flex-1 min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent',
          'focus-visible:ring-0 focus-visible:ring-offset-0',
          'placeholder:text-muted-foreground/50'
        )}
        rows={1}
      />
      
      <Button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        size="icon"
        className="flex-shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
