import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { getBotReply, QUICK_REPLIES, BOT_RESPONSES } from '../utils/chatbotData';

export default function ChatBot({ onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: BOT_RESPONSES.greeting },
  ]);
  const [input,  setInput]  = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  function send(text) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), from: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: Date.now() + 1, from: 'bot', text: getBotReply(text) }]);
    }, 800);
  }

  return (
    <div
      className="fixed bottom-[88px] right-5 w-80 h-[490px] bg-white rounded-2xl flex flex-col z-[1000] overflow-hidden border border-teal-50 animate-scaleIn"
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
    >
      {/* Header */}
      <div className="bg-teal-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🤖</div>
          <div>
            <p className="text-white font-extrabold text-sm leading-tight">MediFlow Assistant</p>
            <p className="text-teal-100 text-xs">● Online · Always here</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-transparent border-0 text-white/80 hover:text-white cursor-pointer p-1">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5" style={{ background: '#F6FAF8' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[84%] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line shadow-sm"
              style={{
                borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background:   msg.from === 'user' ? '#0F6E56' : '#fff',
                color:        msg.from === 'user' ? '#fff'    : '#1C1917',
                border:       msg.from === 'bot' ? '1px solid #f0f0f0' : 'none',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-[18px_18px_18px_4px] px-4 py-3 border border-gray-100 shadow-sm">
              <div className="dot-typing"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick replies */}
      <div className="px-3 pt-2 pb-1.5 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer flex-shrink-0 transition-colors border-0"
              style={{ border: '1.5px solid #0F6E56', color: '#0F6E56', background: 'transparent' }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#E1F5EE')}
              onMouseOut={(e)  => (e.currentTarget.style.background = 'transparent')}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-1.5 bg-white flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Ask me anything..."
          className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none border border-gray-200 bg-gray-50 focus:border-teal-300 transition-colors"
        />
        <button
          onClick={() => send(input)}
          className="w-10 h-10 rounded-full border-0 cursor-pointer flex items-center justify-center flex-shrink-0 bg-teal-600 hover:brightness-105 transition-all active:scale-95"
        >
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
}
