
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useToast } from '@/components/ui/use-toast';

interface ChatPanelProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  onSendMessage, 
  messages, 
  isLoading 
}) => {
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    try {
      await onSendMessage(userMessage);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message to AI. Please try again.",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-sidebar to-background">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-white">AI Website Builder</h2>
        <p className="text-sm text-gray-400">Describe the website you want to build</p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <div className="mb-4 p-3 rounded-full bg-sidebar-accent">
              <Send size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Start Building</h3>
            <p className="text-sm max-w-xs">
              Describe the website you want to create and the AI will generate code for you.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex items-center space-x-2 p-3 bg-secondary rounded-lg mb-4 max-w-[85%] mr-auto">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-slow"></div>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-slow" style={{ animationDelay: "0.2s" }}></div>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-slow" style={{ animationDelay: "0.4s" }}></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            placeholder="Describe your website..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="bg-sidebar-accent text-white border-sidebar-border focus-visible:ring-primary"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="bg-primary hover:bg-primary/80"
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
