import { useState, useRef, useEffect } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, Sparkles } from 'lucide-react';

export default function Assistant() {
  const { settings, chatSessions, currentUser, sendChat } = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  if (!settings.assistantEnabled) return null;

  const userId = currentUser?.id || 'anon';
  const session = chatSessions.find((s) => s.userId === userId);
  const messages = session?.messages || [];

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  const send = () => {
    if (!text.trim()) return;
    sendChat(text.trim());
    setText('');
  };

  return (
    <>
      {/* launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={settings.assistantName}
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full btn-primary glow shadow-xl transition-transform hover:scale-110"
      >
        {open ? <X size={24} /> : <Bot size={26} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 flex h-[30rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl surface-card shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center gap-3 btn-primary px-4 py-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20"><Bot size={22} /></span>
              <div>
                <p className="font-display font-bold leading-tight">{settings.assistantName}</p>
                <p className="text-xs text-white/80">متصل الآن · يساعدك في كل شيء</p>
              </div>
            </div>

            {/* messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <div className="flex gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full btn-primary"><Sparkles size={15} /></span>
                <div className="max-w-[80%] rounded-2xl bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] px-4 py-2 text-sm">{settings.assistantWelcome}</div>
              </div>

              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === 'user' ? 'bg-[color-mix(in_srgb,var(--c-text)_10%,transparent)]' : 'btn-primary'}`}>
                    {m.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </span>
                  <div className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-[color-mix(in_srgb,var(--c-text)_6%,transparent)]' : 'bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)]'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* input */}
            <div className="flex items-center gap-2 border-t border-line p-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="اكتب سؤالك..."
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              />
              <button onClick={send} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl btn-primary"><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
