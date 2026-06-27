import { useState } from 'react';
import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import { MessageSquare, Send, User, Crown } from 'lucide-react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import SearchBar from '../components/SearchBar';

export default function Comments() {
  const { settings, comments, currentUser, addComment } = useStore();
  const [name, setName] = useState(currentUser?.fullName || '');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const approved = comments
    .filter((c) => c.approved)
    .filter((c) => !q || c.name.toLowerCase().includes(q) || c.text.toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date));

  const submit = () => {
    if (!name.trim() || !text.trim()) return;
    addComment(name.trim(), text.trim());
    setText(''); setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  if (!settings.commentsEnabled) {
    return <Layout><div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted">التعليقات معطّلة حالياً.</div></Layout>;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><MessageSquare size={26} /></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">{settings.commentsTitle}</h1>
            <p className="text-muted">شاركنا رأيك وملاحظاتك</p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl surface-card p-6">
          {sent && <div className="mb-4 rounded-xl bg-green-500/15 px-4 py-3 text-sm font-semibold text-green-600">شكراً لك! تم إرسال تعليقك وسيظهر بعد المراجعة.</div>}
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" className="mb-3 w-full rounded-xl px-4 py-3 outline-none" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب تعليقك هنا..." rows={4} className="w-full rounded-xl px-4 py-3 outline-none" />
          <button onClick={submit} className="mt-3 flex items-center gap-2 rounded-xl btn-primary px-6 py-2.5 font-bold"><Send size={18} /> إرسال التعليق</button>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="ابحث في التعليقات..." />

        <div className="space-y-4">
          {approved.length === 0 ? (
            <p className="text-center text-muted">لا توجد تعليقات بعد. كن أول المعلقين!</p>
          ) : approved.map((c, i) => (
            <motion.div
              key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`relative rounded-2xl p-5 ${c.vip ? 'vip-card' : 'surface-card'}`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* small crown/tag icon above avatar for VIP */}
                  {c.vip && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Crown size={14} className="vip-crown" fill="currentColor" />
                    </span>
                  )}
                  <span className={`grid h-10 w-10 place-items-center rounded-full ${c.vip ? 'vip-avatar' : 'btn-primary'}`}><User size={18} /></span>
                </div>
                <div>
                  <p className="flex items-center gap-2 font-bold">
                    {c.name}
                    {c.vip && <span className="vip-badge">VIP</span>}
                  </p>
                  <p className="text-xs text-muted">{c.date}</p>
                </div>
              </div>
              <p className="mt-3 leading-relaxed text-muted">{c.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
