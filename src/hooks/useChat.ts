import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const useChat = (language: string = 'en') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load or create conversation
  useEffect(() => {
    if (!user) return;

    const loadConversation = async () => {
      // Try to get existing conversation
      const { data: conversations } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('language', language)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (conversations && conversations.length > 0) {
        const conv = conversations[0];
        setConversationId(conv.id);

        // Load messages
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });

        if (msgs) {
          setMessages(msgs as ChatMessage[]);
        }
      } else {
        // Create new conversation
        const { data: newConv } = await supabase
          .from('chat_conversations')
          .insert({ user_id: user.id, language })
          .select()
          .single();

        if (newConv) {
          setConversationId(newConv.id);
        }
      }
    };

    loadConversation();
  }, [user, language]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !conversationId) return;

      setIsLoading(true);
      try {
        // Save user message
        const { data: userMsg } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            role: 'user',
            content,
          })
          .select()
          .single();

        if (userMsg) {
          setMessages((prev) => [...prev, userMsg as ChatMessage]);
        }

        // Get AI response
        const { data, error } = await supabase.functions.invoke('chat-with-ai', {
          body: {
            messages: [
              ...messages.map(m => ({ role: m.role, content: m.content })),
              { role: 'user', content }
            ],
            conversationId,
            language,
          },
        });

        if (error) throw error;

        // Load the saved assistant message
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (msgs) {
          setMessages(msgs as ChatMessage[]);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, conversationId, messages, language, toast]
  );

  const clearHistory = useCallback(async () => {
    if (!conversationId) return;

    try {
      await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', conversationId);

      setMessages([]);
      toast({
        title: 'Success',
        description: 'Chat history cleared',
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear history',
        variant: 'destructive',
      });
    }
  }, [conversationId, toast]);

  return {
    messages,
    isLoading,
    isSpeaking,
    setIsSpeaking,
    sendMessage,
    clearHistory,
  };
};