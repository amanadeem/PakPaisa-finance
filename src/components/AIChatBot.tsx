import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, BookOpen, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types.ts';

interface AIChatBotProps {
  userProfile: {
    salary: number;
    taxStatus: 'filer' | 'non-filer';
    majorGoal: string;
    riskPref: 'Low' | 'Medium' | 'High';
    banks: string[];
  };
}

const GREETING: ChatMessage = {
  id: 'greet',
  role: 'model',
  content: `Assalam-o-Alaikum! 🇵🇰 I'm **RupeeWise**, your local personal finance and investment advisor. 

I can advise you on:
- 📉 How to shield your savings from PKR inflation.
- 🏛️ Navigating the FBR tax landscape (**Filer vs Non-Filer**).
- 🕌 Safe, Shariah-compliant **Halal Mutual Funds** (like Al Meezan, UBL, etc.).
- 🪙 Accumulating **Gold (per Tola/10g)** as a physical hedge.
- 🧮 Calculating your **Zakat** (2.5%) correctly across assets.

What is on your mind today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const SUGGESTED_CHIPS = [
  "How can I become an FBR Tax Filer in Pakistan?",
  "Best Halal monthly savings funds for low-risk?",
  "Is investing in Gold (Saraf rates) safe?",
  "How is Zakat calculated on modern saving accounts?",
  "Compare KSE100 Stocks vs National Savings (NSS)"
];

export default function AIChatBot({ userProfile }: AIChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMsg).trim();
    if (!textToSend) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');
    setLoading(true);
    setError(null);

    try {
      const chatLog = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatLog,
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error('Advisor network returned an error code.');
      }

      const replyData = await response.json();
      
      const replyMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: replyData.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, replyMessage]);
    } catch (err: any) {
      setError("Unable to obtain advice. " + err.message);
      // Fallback response inside the chat logs so it doesn't leave the user hanging
      const fallbackReply: ChatMessage = {
        id: `ai-${Date.now()}-fallback`,
        role: 'model',
        content: `I'm briefly offline, but here is a **RupeeWise Tip**: In Pakistan, **always prioritize getting FBR Filer status** via the IRIS portal. Non-filers are taxed up to 30% on capital gains and incur double taxes on banking profits and transactions!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-700/55 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">RupeeWise Advisor</h2>
            <p className="text-[10px] text-emerald-100 font-medium">Smart AI Advisor for PK Personal Finance</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 bg-emerald-900/50 px-2 py-1 rounded-md text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse animate-duration-1000"></span>
          <span>Online</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-2 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`p-1.5 rounded-lg flex-shrink-0 flex items-center justify-center ${
                m.role === 'user' ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-slate-100 text-teal-800'
              }`}>
                {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              </div>
              <div className={`p-3 rounded-2xl space-y-1 shadow-xs ${
                m.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none text-sm font-sans'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none text-xs leading-relaxed'
              }`}>
                <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                  {m.content.split('\n').map((line, lIdx) => {
                    let formatted = line;
                    const boldMatches = line.match(/\*\*(.*?)\*\*/g);
                    if (boldMatches) {
                      boldMatches.forEach(match => {
                        const word = match.replace(/\*\*/g, '');
                        formatted = formatted.replace(match, `<strong class="font-bold font-sans text-emerald-950">${word}</strong>`);
                      });
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <div key={lIdx} className="flex gap-1.5 my-1 pl-1 items-start">
                          <span className="text-emerald-500">•</span>
                          <span dangerouslySetInnerHTML={{ __html: formatted.substring(2) }} />
                        </div>
                      );
                    }
                    return <p key={lIdx} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
                  })}
                </div>
                <span className={`block text-[92%] text-right mt-1.5 ${
                  m.role === 'user' ? 'text-emerald-100' : 'text-slate-400'
                }`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-white border border-slate-100 p-3 rounded-2xl shadow-xs rounded-tl-none">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[10px] text-slate-400 font-medium font-sans">RupeeWise thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-750 text-xs flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Topic Chips */}
      <div className="p-2 border-t border-slate-100/60 flex gap-1.5 overflow-x-auto whitespace-nowrap bg-white custom-scrollbar">
        {SUGGESTED_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            id={`chat-chip-${idx}`}
            onClick={() => handleSendMessage(chip)}
            className="text-[10px] px-2.5 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-805 border border-slate-200 text-slate-650 rounded-lg transition-colors font-medium flex items-center space-x-1 flex-shrink-0 cursor-pointer"
          >
            <BookOpen className="h-3 w-3 text-emerald-500" />
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Input Message Area */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
        <input
          id="chat-text-input"
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
          placeholder="Ask about Filer taxes, mutual funds, gold per tola, Zakat..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none placeholder-slate-400 text-slate-800"
          disabled={loading}
        />
        <button
          id="chat-send-btn"
          type="button"
          onClick={() => handleSendMessage()}
          disabled={loading || !inputMsg.trim()}
          className={`p-2.5 rounded-xl text-white transition-all ${
            loading || !inputMsg.trim() ? 'bg-slate-200 text-slate-450 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-800 shadow-xs'
          }`}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
