import React, { useState, useEffect } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from './ui/button';
import { ChatWindow } from './ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export const ChatBot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('chatbot-welcome-seen');
    if (!seen) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
        localStorage.setItem('chatbot-welcome-seen', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!user) return null;

  return (
    <>
      {/* Welcome Message Popup */}
      {!isOpen && showWelcome && (
        <div className="fixed bottom-24 right-6 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg max-w-[280px] animate-in fade-in slide-in-from-bottom-2">
          <button
            onClick={() => {
              setShowWelcome(false);
              localStorage.setItem('chatbot-welcome-seen', 'true');
            }}
            className="absolute top-2 right-2 h-5 w-5 rounded-full hover:bg-primary-foreground/20 flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="flex items-start gap-2">
            <Bot className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Hi! I'm GreenSkill Assistant</p>
              <p className="text-xs opacity-90 mt-1">
                I'm an AI chatbot here to help you learn about climate action! Click the button below to chat with me.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-primary hover:bg-primary/90 transition-all duration-200",
          isOpen && "scale-0"
        )}
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] md:w-[420px] h-[600px] bg-background border border-border rounded-lg shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">GreenSkill Assistant</h3>
                <p className="text-xs text-muted-foreground">Here to help you learn!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ChatWindow />
        </div>
      )}
    </>
  );
};