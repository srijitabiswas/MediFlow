import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Toast from './components/Toast';
import { MessageCircle, X } from 'lucide-react';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#F0F7F4]">
        <Navbar />
        <main>
          <AppRoutes />
        </main>

        {/* Floating chatbot toggle */}
        <button
          onClick={() => setChatOpen((o) => !o)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full border-0 cursor-pointer flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95"
          style={{ background: '#0F6E56', boxShadow: '0 8px 28px rgba(15,110,86,.45)' }}
          aria-label="Open chat assistant"
        >
          {chatOpen
            ? <X size={22} color="#fff" />
            : <MessageCircle size={22} color="#fff" />}
        </button>

        {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}
        <Toast />
      </div>
    </AppProvider>
  );
}
