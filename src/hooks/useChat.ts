import { useState, useCallback } from 'react';
import { Message } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { generateId } from '@/lib/utils';

interface UseChatOptions {
  conversationId?: string;
  onError?: (error: Error) => void;
}

export function useChat({ conversationId, onError }: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [currentAgent, setCurrentAgent] = useState<string | undefined>();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      conversation_id: conversationId || '',
      role: 'user',
      content: content.trim(),
      metadata: {},
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setStreamingContent(assistantContent);
            }
          } catch {
            // Incomplete JSON, will be handled in next chunk
          }
        }
      }

      const assistantMessage: Message = {
        id: generateId(),
        conversation_id: conversationId || '',
        role: 'assistant',
        content: assistantContent,
        metadata: { agent: currentAgent },
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
      setCurrentAgent(undefined);
    }
  }, [conversationId, messages, isLoading, currentAgent, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
  }, []);

  return {
    messages,
    isLoading,
    streamingContent,
    currentAgent,
    sendMessage,
    clearMessages,
    setMessages,
  };
}
