import { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trophy, Check, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';

export default function GuestSetup() {
  const { currentUser, competitions, updateProfile, setActiveCompetition } = useStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>(currentUser?.competitions[0] || '');

  if (!currentUser) { navigate('/auth'); return null; }

  const active = competitions.filter((c) => c.active);

  const proceed = () => {
    if (!selected) return;
    updateProfile({ competitions: [selected] });
    setActiveCompetition(selected);
    navigate('/home');
  };

  return (
    <Layout>
      <div className="mx-auto flex max-w-lg flex-col px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl surface-card p-7 shadow-2xl">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl btn-primary"><Users size={32} /></div>
            <h1 className="font-display text-2xl font-extrabold">اختر المسابقة</h1>
            <p className="mt-2 text-sm text-muted">
              مرحباً بك كزائر! اختر المسابقة التي تريد خوض اختباراتها. لديك اختباران فقط.
            </p>
          </div>

          <div className="space-y-2.5">
            {active.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.name)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-right transition ${
                  selected === c.name
                    ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary'
                    : 'border-line hover:border-primary'
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl btn-primary"><Trophy size={20} /></span>
                <span className="flex-1">
                  <span className="block font-bold">{c.name}</span>
                  <span className="block text-xs text-muted">{c.description}</span>
                </span>
                {selected === c.name && <Check size={20} className="text-primary" />}
              </button>
            ))}
          </div>

          <button
            onClick={proceed}
            disabled={!selected}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl btn-primary py-3.5 text-lg font-bold disabled:opacity-40"
          >
            متابعة <ArrowLeft size={20} />
          </button>
        </motion.div>
      </div>
    </Layout>
  );
}
