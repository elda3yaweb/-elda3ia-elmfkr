import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';

export default function Instructions() {
  const { settings } = useStore();
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><BookOpen size={26} /></div>
          <h1 className="font-display text-3xl font-extrabold">{settings.instructionsTitle}</h1>
        </div>
        <div className="space-y-3">
          {settings.instructions.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 rounded-2xl surface-card p-5"
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full btn-primary text-sm font-bold">{i + 1}</span>
              <p className="flex-1 leading-relaxed">{ins}</p>
              <CheckCircle2 className="mt-1 shrink-0 text-primary" size={20} />
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
