import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import ChatPanel from '@/components/ChatPanel';
import PreviewPanel from '@/components/PreviewPanel';
import ApiKeyModal from '@/components/ApiKeyModal';
import { 
  generateWebsite, 
  improveWebsite, 
  hasApiKey 
} from '@/services/geminiService';
import { Message } from '@/types/gemini';

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');

  // Check for API key on initial load
  useEffect(() => {
    if (!hasApiKey()) {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!hasApiKey()) {
      setIsApiKeyModalOpen(true);
      return;
    }

    // Add user message to the chat
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);
    setCurrentPrompt(message);

    try {
      // If we already have a website, try to improve it
      let result;
      if (generatedHtml && messages.length > 0) {
        result = await improveWebsite(generatedHtml, message);
      } else {
        // Otherwise generate a new website
        result = await generateWebsite(message);
      }

      setGeneratedHtml(result);

      // Add AI response to the chat
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: "I've generated a website based on your request. You can see the preview on the right or view the code in the 'Code' tab. Let me know if you want to make any improvements!"
        }
      ]);
    } catch (error) {
      console.error('Error generating website:', error);
      toast({
        title: "Error",
        description: "Failed to generate website. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateWebsite = async () => {
    if (!currentPrompt) {
      toast({
        title: "No prompt",
        description: "Please enter a prompt first to generate a website.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateWebsite(currentPrompt);
      setGeneratedHtml(result);
      
      // Add a message about regeneration
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: "I've regenerated the website with some variations. How does this look?"
        }
      ]);
      
      toast({
        title: "Website Regenerated",
        description: "The website has been regenerated with the same prompt but different variations.",
      });
    } catch (error) {
      console.error('Error regenerating website:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate website.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Chat Panel (Left) */}
      <div className="w-1/3 h-full border-r border-border">
        <ChatPanel 
          onSendMessage={handleSendMessage} 
          messages={messages}
          isLoading={isLoading}
        />
      </div>
      
      {/* Preview Panel (Right) */}
      <div className="w-2/3 h-full">
        <PreviewPanel 
          generatedHtml={generatedHtml} 
          isLoading={isLoading}
          onRefresh={handleRegenerateWebsite}
        />
      </div>

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
