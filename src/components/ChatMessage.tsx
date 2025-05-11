
import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightAllUnder(codeRef.current);
    }
  }, [message.content]);

  const formatContent = (content: string) => {
    // Basic formatting for code blocks
    if (content.includes('```html') || content.includes('```css') || content.includes('```javascript')) {
      const parts = content.split(/```(html|css|javascript|js)/);
      return parts.map((part, index) => {
        if (index % 2 === 0) {
          return <div key={index} className="whitespace-pre-wrap mb-2">{part}</div>;
        } else {
          const language = part === 'js' ? 'javascript' : part;
          const code = parts[index + 1].split('```')[0];
          return (
            <div key={index} className="code-highlight mb-4 rounded-md">
              <div className="text-xs text-gray-400 mb-1">{language}</div>
              <pre>
                <code className={`language-${language}`}>{code.trim()}</code>
              </pre>
            </div>
          );
        }
      });
    }
    
    return <div className="whitespace-pre-wrap">{content}</div>;
  };

  return (
    <div
      className={`p-4 mb-4 rounded-lg max-w-[85%] ${
        message.role === 'user'
          ? 'bg-secondary ml-auto text-white'
          : 'bg-accent mr-auto text-white'
      }`}
      ref={codeRef}
    >
      {formatContent(message.content)}
    </div>
  );
};

export default ChatMessage;
