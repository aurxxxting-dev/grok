import React, { useState } from 'react';
import { Role, Message } from '../types';
import { User, Bot, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onImageClick: (src: string) => void;
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-md overflow-hidden border border-gray-800 bg-[#080808]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#121212] border-b border-gray-800">
        <span className="text-[10px] font-mono text-gray-400 lowercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs font-mono text-gray-300">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const ImageThumbnail: React.FC<{ src: string; alt: string; onClick: () => void }> = ({ src, alt, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="relative group cursor-zoom-in w-32 h-32 sm:w-36 sm:h-36 rounded-lg overflow-hidden border border-gray-800 shadow-md hover:border-primary-500/50 transition-all bg-[#0a0a0a] flex-shrink-0"
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
    </div>
  );
};

// Parser to handle code blocks and markdown images, grouping adjacent images horizontally
const FormattedText: React.FC<{ content: string; onImageClick: (src: string) => void }> = ({ content, onImageClick }) => {
  if (!content) return null;

  // Split code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="text-gray-200 leading-relaxed break-words text-sm">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
          if (match) {
            return <CodeBlock key={index} language={match[1]} code={match[2]} />;
          }
        }
        
        // Split by Markdown Image syntax: ![alt](url)
        const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const splitContent = part.split(imgRegex);
        
        if (splitContent.length === 1) {
            return <span key={index} className="whitespace-pre-wrap">{part}</span>;
        }

        const nodes: React.ReactNode[] = [];
        let currentImages: {src: string, alt: string}[] = [];
        
        const flushImages = () => {
             if (currentImages.length > 0) {
                nodes.push(
                    <div key={`img-group-${nodes.length}`} className="flex flex-wrap gap-2 my-3">
                        {currentImages.map((img, idx) => (
                            <ImageThumbnail key={idx} src={img.src} alt={img.alt} onClick={() => onImageClick(img.src)} />
                        ))}
                    </div>
                );
                currentImages = [];
            }
        };

        for (let i = 0; i < splitContent.length; i += 3) {
            const text = splitContent[i];
            
            if (text) {
                // Determine if text is just whitespace (newlines, spaces)
                const isJustWhitespace = !text.trim();
                
                if (isJustWhitespace && currentImages.length > 0) {
                    // Ignore whitespace if we are in the middle of collecting images to allow grouping
                } else {
                    // Flush any pending images before rendering significant text
                    flushImages();
                    nodes.push(<span key={`text-${i}`} className="whitespace-pre-wrap">{text}</span>);
                }
            }

            if (i + 2 < splitContent.length) {
                const alt = splitContent[i+1];
                const src = splitContent[i+2];
                currentImages.push({ alt, src });
            }
        }
        
        flushImages();

        return <div key={index}>{nodes}</div>;
      })}
    </div>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onImageClick }) => {
  const isUser = message.role === Role.User;

  return (
    <div className={`flex w-full mb-5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border border-white/5 shadow-inner ${
          isUser 
            ? 'bg-gradient-to-br from-primary-600 to-primary-800' 
            : 'bg-[#151515]'
        }`}>
          {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary-500" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full min-w-0`}>
          <div className={`px-5 py-3.5 rounded-2xl shadow-sm max-w-full text-sm leading-relaxed ${
            isUser 
              ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-white border border-primary-600/30' 
              : 'bg-[#121212] border border-[#222] text-gray-200'
          }`}>
            {message.imageUrl && message.role === Role.User && (
               <div className="mb-2">
                 <ImageThumbnail src={message.imageUrl} alt="Uploaded" onClick={() => onImageClick(message.imageUrl!)} />
               </div>
            )}
            
            {message.imageUrl && message.role === Role.Assistant ? (
               <div className="space-y-2">
                  {message.content && <p className="opacity-90">{message.content}</p>}
                   <ImageThumbnail src={message.imageUrl} alt="Generated" onClick={() => onImageClick(message.imageUrl!)} />
               </div>
            ) : (
              <FormattedText content={message.content} onImageClick={onImageClick} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;