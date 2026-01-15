import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, Paperclip, Loader2, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import MessageBubble from './components/MessageBubble';
import ImageViewer from './components/ImageViewer';
import { sendChatRequest } from './services/api';
import { Role, Message } from './types';
import { STORAGE_KEY_API_KEY, DEFAULT_CHAT_MODEL } from './constants';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Image Viewer State
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load API Key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY_API_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsSettingsOpen(true);
    }
  }, []);

  // Save API Key when changed
  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(STORAGE_KEY_API_KEY, key);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("Image too large. Please select an image under 10MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || !apiKey) return;

    const currentInput = input;
    const currentImage = selectedImage;

    setInput('');
    setSelectedImage(null);
    
    // Construct User Message
    const userMessage: Message = { 
      role: Role.User, 
      content: currentInput,
      imageUrl: currentImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.slice(-10);
      const responseContent = await sendChatRequest(apiKey, [...history, userMessage], DEFAULT_CHAT_MODEL);
      
      const botMessage: Message = { role: Role.Assistant, content: responseContent };
      setMessages(prev => [...prev, botMessage]);

    } catch (error: any) {
      const errorMessage: Message = { 
        role: Role.System, 
        content: `Error: ${error.message || 'Connection failed.'}` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#020202] text-slate-200 font-sans selection:bg-primary-600 selection:text-white overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary-800/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="flex-none h-16 border-b border-[#1a1a1a] bg-[#020202]/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-primary-700 to-primary-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(109,40,217,0.3)] ring-1 ring-white/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight text-white leading-none mb-1">Grok-3 AI</h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Research Preview</span>
          </div>
        </div>
        
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth relative z-0">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]">
              <div className="w-20 h-20 bg-gradient-to-b from-[#111] to-[#0a0a0a] rounded-3xl flex items-center justify-center mb-6 border border-[#222] shadow-[0_0_40px_-10px_rgba(109,40,217,0.2)]">
                <Sparkles className="w-10 h-10 text-primary-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                Grok-3 Intelligence
              </h2>
              <p className="text-gray-500 text-sm max-w-sm mb-10 leading-relaxed">
                Experience next-generation AI with advanced reasoning and multimodal capabilities.
              </p>
              {!apiKey && (
                 <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-8 py-3 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white text-sm rounded-full font-semibold transition-all shadow-[0_0_25px_rgba(109,40,217,0.4)] active:scale-95"
                >
                  Connect API Key
                 </button>
              )}
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((msg, idx) => (
                <MessageBubble 
                  key={idx} 
                  message={msg} 
                  onImageClick={(src) => setViewerImage(src)} 
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 text-primary-500 text-xs py-2 px-3 animate-pulse ml-1">
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                  <span className="font-medium tracking-wide opacity-80">PROCESSING</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="flex-none p-4 lg:p-6 bg-[#020202] relative z-20">
        <div className="max-w-3xl mx-auto relative">
          
          {/* Image Preview */}
          {selectedImage && (
            <div className="absolute bottom-full left-0 mb-4 ml-1 animate-[fadeIn_0.2s_ease-out]">
              <div className="relative inline-block group">
                <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-xl border border-[#333] shadow-xl" />
                <button 
                  onClick={clearSelectedImage}
                  className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 border border-black hover:bg-gray-700 transition-colors shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <form 
            onSubmit={handleSubmit}
            className={`relative rounded-2xl border transition-all duration-300 flex items-end p-2 gap-2 ${
              isSettingsOpen || !apiKey 
                ? 'border-[#1a1a1a] bg-[#0a0a0a] opacity-50 cursor-not-allowed' 
                : 'border-[#222] bg-[#0a0a0a] hover:border-[#333] focus-within:border-primary-600/50 focus-within:ring-1 focus-within:ring-primary-600/20 shadow-2xl'
            }`}
          >
            {/* File Upload */}
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              className="hidden" 
              onChange={handleFileSelect}
              disabled={isLoading || !apiKey}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !apiKey}
              className={`p-3 rounded-xl transition-all mb-0.5 ${
                selectedImage 
                  ? 'bg-primary-900/20 text-primary-400' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
              title="Upload Image"
            >
              {selectedImage ? <ImageIcon className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !apiKey}
              placeholder={!apiKey ? "Please configure API key..." : "Message Grok-3..."}
              className="w-full bg-transparent border-none text-gray-100 placeholder-gray-600 py-3.5 px-2 text-[15px] resize-none focus:ring-0 max-h-[150px] scrollbar-hide"
              rows={1}
              style={{ minHeight: '52px' }}
            />
            
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isLoading || !apiKey}
              className="p-3 bg-gradient-to-tr from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 disabled:from-[#222] disabled:to-[#222] disabled:text-gray-600 text-white rounded-xl transition-all active:scale-95 flex-shrink-0 mb-0.5 shadow-lg shadow-primary-900/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <div className="mt-3 text-center">
            <p className="text-[11px] text-gray-700 font-medium">
              Grok-3 can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>

      <ImageViewer 
        isOpen={!!viewerImage} 
        src={viewerImage} 
        onClose={() => setViewerImage(null)} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey} 
        setApiKey={handleSetApiKey} 
      />
    </div>
  );
};

export default App;