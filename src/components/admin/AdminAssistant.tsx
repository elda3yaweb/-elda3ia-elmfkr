import { useState } from 'react';
import { useStore } from '../../lib/store';
import { Section, TextField, AreaField, Toggle } from './ui';
import { MessageSquare, User, Bot, Edit3, Check, X, Brain, Plus, Trash2, GraduationCap } from 'lucide-react';

export default function AdminAssistant() {
  const {
    settings, updateSettings, chatSessions, adminEditAssistantReply,
    assistantKnowledge, addKnowledge, updateKnowledge, deleteKnowledge, teachFromMessage,
  } = useStore();
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<{ sid: string; mid: string } | null>(null);
  const [editText, setEditText] = useState('');
  const [teaching, setTeaching] = useState<{ sid: string; mid: string } | null>(null);
  const [teachText, setTeachText] = useState('');

  // knowledge form
  const [kw, setKw] = useState('');
  const [ans, setAns] = useState('');
  const [editK, setEditK] = useState<string | null>(null);
  const [editKw, setEditKw] = useState('');
  const [editAns, setEditAns] = useState('');

  const set = (p: Partial<typeof s>) => { setS((x) => ({ ...x, ...p })); setSaved(false); };
  const save = () => { updateSettings(s); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const addK = () => { if (kw.trim() && ans.trim()) { addKnowledge(kw.trim(), ans.trim()); setKw(''); setAns(''); } };

  return (
    <div>
      <Section title="إعدادات المساعد الذكي">
        <Toggle label="تفعيل المساعد الذكي (يظهر للجميع من شاشة الترحيب)" value={s.assistantEnabled} onChange={(v) => set({ assistantEnabled: v })} />
        <TextField label="اسم المساعد" value={s.assistantName} onChange={(v) => set({ assistantName: v })} />
        <AreaField label="رسالة الترحيب" value={s.assistantWelcome} onChange={(v) => set({ assistantWelcome: v })} />
        <div className="flex items-center gap-3">
          <button onClick={save} className="rounded-xl btn-primary px-6 py-2.5 font-bold">حفظ</button>
          {saved && <span className="text-sm font-semibold text-green-600">✓ تم الحفظ</span>}
        </div>
      </Section>

      {/* ===== KNOWLEDGE BASE ===== */}
      <div className="mt-8 rounded-2xl border border-line p-5">
        <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-primary"><Brain size={20} /> تعليم المساعد (قاعدة المعرفة)</h3>
        <p className="mb-4 text-sm text-muted">أضف أسئلة شائعة وإجاباتها، وسيحفظها المساعد ويرد بها تلقائياً لأي مستخدم يسأل سؤالاً مشابهاً. (لن يجيب أبداً على أسئلة بنك الاختبارات).</p>

        <div className="space-y-2 rounded-xl bg-[color-mix(in_srgb,var(--c-primary)_6%,transparent)] p-3">
          <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="كلمات مفتاحية للسؤال (مثال: موعد المسابقة، متى تبدأ)" className="w-full rounded-lg px-3 py-2 text-sm outline-none" />
          <textarea value={ans} onChange={(e) => setAns(e.target.value)} placeholder="الإجابة التي سيرد بها المساعد" rows={2} className="w-full rounded-lg px-3 py-2 text-sm outline-none" />
          <button onClick={addK} className="flex items-center gap-1 rounded-lg btn-primary px-4 py-2 text-sm font-bold"><Plus size={15} /> إضافة للمعرفة</button>
        </div>

        <div className="mt-4 space-y-2">
          {assistantKnowledge.length === 0 ? (
            <p className="text-center text-sm text-muted">لا توجد معلومات مضافة بعد.</p>
          ) : assistantKnowledge.map((k) => (
            <div key={k.id} className="rounded-xl border border-line p-3">
              {editK === k.id ? (
                <div className="space-y-2">
                  <input value={editKw} onChange={(e) => setEditKw(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" />
                  <textarea value={editAns} onChange={(e) => setEditAns(e.target.value)} rows={2} className="w-full rounded-lg px-3 py-2 text-sm outline-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { updateKnowledge(k.id, editKw, editAns); setEditK(null); }} className="flex items-center gap-1 rounded-lg btn-primary px-3 py-1 text-xs font-bold"><Check size={14} /> حفظ</button>
                    <button onClick={() => setEditK(null)} className="rounded-lg border border-line px-3 py-1 text-xs">إلغاء</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-primary">🔑 {k.keywords}</p>
                    <p className="mt-1 whitespace-pre-line text-sm">{k.answer}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditK(k.id); setEditKw(k.keywords); setEditAns(k.answer); }} className="text-primary"><Edit3 size={15} /></button>
                    <button onClick={() => deleteKnowledge(k.id)} className="text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== CHAT SESSIONS ===== */}
      <h3 className="mb-3 mt-8 flex items-center gap-2 font-display text-lg font-bold text-primary"><MessageSquare size={20} /> محادثات المستخدمين ({chatSessions.length})</h3>
      <p className="mb-3 text-sm text-muted">راجع المحادثات، عدّل ردود المساعد، أو "علّم المساعد" إجابة جديدة من سؤال لم يُجب عليه جيداً.</p>

      {chatSessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">لا توجد محادثات بعد.</div>
      ) : (
        <div className="space-y-4">
          {chatSessions.map((sess) => (
            <div key={sess.id} className="rounded-2xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-bold">{sess.userName}</p>
                <p className="text-xs text-muted">{sess.updatedAt}</p>
              </div>
              <div className="space-y-2">
                {sess.messages.map((m) => (
                  <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === 'user' ? 'bg-[color-mix(in_srgb,var(--c-text)_10%,transparent)]' : 'btn-primary'}`}>{m.role === 'user' ? <User size={16} /> : <Bot size={16} />}</span>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-[color-mix(in_srgb,var(--c-text)_6%,transparent)]' : 'bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)]'}`}>
                      {editing && editing.sid === sess.id && editing.mid === m.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} className="w-72 max-w-full rounded-lg px-3 py-2 text-sm outline-none" />
                          <div className="flex gap-2">
                            <button onClick={() => { adminEditAssistantReply(sess.id, m.id, editText); setEditing(null); }} className="flex items-center gap-1 rounded-lg btn-primary px-3 py-1 text-xs font-bold"><Check size={14} /> حفظ</button>
                            <button onClick={() => setEditing(null)} className="flex items-center gap-1 rounded-lg border border-line px-3 py-1 text-xs"><X size={14} /> إلغاء</button>
                          </div>
                        </div>
                      ) : teaching && teaching.sid === sess.id && teaching.mid === m.id ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-bold text-primary">علّم المساعد الإجابة الصحيحة (سيحفظها لكل من يسأل سؤالاً مشابهاً):</p>
                          <textarea value={teachText} onChange={(e) => setTeachText(e.target.value)} rows={3} className="w-72 max-w-full rounded-lg px-3 py-2 text-sm outline-none" />
                          <div className="flex gap-2">
                            <button onClick={() => { teachFromMessage(sess.id, m.id, teachText); setTeaching(null); setTeachText(''); }} className="flex items-center gap-1 rounded-lg btn-primary px-3 py-1 text-xs font-bold"><GraduationCap size={14} /> تعليم وحفظ</button>
                            <button onClick={() => setTeaching(null)} className="rounded-lg border border-line px-3 py-1 text-xs">إلغاء</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <span className="whitespace-pre-line">{m.text}</span>
                          {m.role === 'assistant' && (
                            <span className="flex shrink-0 gap-1">
                              <button title="تعديل الرد" onClick={() => { setEditing({ sid: sess.id, mid: m.id }); setEditText(m.text); }} className="text-primary"><Edit3 size={14} /></button>
                              <button title="علّم المساعد" onClick={() => { setTeaching({ sid: sess.id, mid: m.id }); setTeachText(m.text); }} className="text-secondary"><GraduationCap size={14} /></button>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
