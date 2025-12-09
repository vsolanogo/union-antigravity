import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Loader2, Cpu, Zap, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ChatMessage, ConnectionStatus } from '../types';

const TerminalChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'system', 
      text: 'TENSOR CORE v4.2 INITIALIZED. WAITING FOR INPUT VECTOR...', 
      id: 'init', 
      timestamp: Date.now() 
    }
  ]);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTED);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStatus(ConnectionStatus.PROCESSING);
    
    try {
      const responseText = await geminiService.sendMessage(input);
      const aiMsg: ChatMessage = {
        role: 'model',
        text: responseText,
        id: (Date.now() + 1).toString(),
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
      setStatus(ConnectionStatus.CONNECTED);
    } catch (e) {
      console.error(e);
      setStatus(ConnectionStatus.DISCONNECTED);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const clearChat = () => {
      setMessages([{ 
        role: 'system', 
        text: 'MEMORY BUFFER CLEARED. READY.', 
        id: Date.now().toString(), 
        timestamp: Date.now() 
      }]);
  }

  // If closed, show a minimal floating action button (FAB)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-full text-cyan-400 hover:text-white hover:bg-cyan-900/30 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-300 z-50 group"
      >
        <Terminal className="w-6 h-6 animate-pulse group-hover:animate-none" />
        <span className="sr-only">Open Terminal</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-md bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in-20">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/30 border-b border-cyan-900/50">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400 font-bold tracking-widest">TENSOR_CORE_API</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={clearChat} className="p-1 hover:text-red-400 text-cyan-700 transition-colors" title="Clear Buffer">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:text-white text-cyan-400 transition-colors">
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 font-mono text-sm relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-md border ${
                msg.role === 'user'
                  ? 'bg-cyan-900/20 border-cyan-500/30 text-cyan-100 rounded-br-none'
                  : msg.role === 'system' 
                    ? 'bg-red-900/10 border-red-500/30 text-red-300 w-full text-center text-xs'
                    : 'bg-slate-900/50 border-cyan-900/50 text-gray-300 rounded-bl-none'
              }`}
            >
              {msg.role === 'model' && <Zap className="w-3 h-3 text-yellow-400 mb-1 inline-block mr-2" />}
              {msg.text}
            </div>
            <span className="text-[10px] text-cyan-700/50 mt-1 uppercase">
              {msg.role === 'user' ? 'USR_VEC' : msg.role === 'model' ? 'SYS_RES' : 'SYS_LOG'} // {new Date(msg.timestamp).toLocaleTimeString([], {hour12: false})}
            </span>
          </div>
        ))}
        {status === ConnectionStatus.PROCESSING && (
          <div className="flex items-center gap-2 text-cyan-500/70 text-xs animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>CALCULATING TENSOR GRADIENTS...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-black/40 border-t border-cyan-900/50">
        <div className="flex items-center gap-2 bg-cyan-950/20 border border-cyan-900/50 rounded-md px-3 py-2 focus-within:border-cyan-500/50 focus-within:bg-cyan-950/40 transition-all">
          <span className="text-cyan-600 font-mono">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command or query..."
            className="flex-1 bg-transparent border-none outline-none text-cyan-100 font-mono text-sm placeholder-cyan-900"
            autoComplete="off"
          />
          <button
            onClick={handleSend}
            disabled={status === ConnectionStatus.PROCESSING || !input.trim()}
            className="text-cyan-600 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminalChat;