import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import { Crown, Check, X, MessageCircle, CreditCard, Sparkles } from 'lucide-react';
import { waLink } from '../lib/utils';

export default function SubscribeModal({ onClose }: { onClose: () => void }) {
  const { settings } = useStore();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[var(--c-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="relative overflow-hidden p-7 text-center text-white" style={{ background: 'linear-gradient(135deg, var(--c-secondary), var(--c-primary))' }}>
          <button onClick={onClose} className="absolute left-4 top-4 text-white/80 hover:text-white"><X size={22} /></button>
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white/20">
            <Crown size={34} />
          </div>
          <h2 className="font-display text-2xl font-extrabold">{settings.subscriptionTitle}</h2>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-1.5 text-lg font-bold">
            <Sparkles size={18} /> {settings.subscriptionPrice}
          </p>
        </div>

        <div className="p-6">
          {/* features */}
          <h3 className="mb-3 font-display text-lg font-bold text-primary">مميزات الاشتراك</h3>
          <ul className="space-y-2.5">
            {settings.subscriptionFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green-500/15 text-green-600"><Check size={15} /></span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* payment info */}
          <div className="mt-6 rounded-2xl bg-[color-mix(in_srgb,var(--c-primary)_8%,transparent)] p-4">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-primary"><CreditCard size={18} /> طريقة الدفع</h4>
            <p className="whitespace-pre-line text-sm text-muted">{settings.subscriptionPaymentInfo}</p>
          </div>

          {/* whatsapp */}
          <a
            href={waLink(settings.subscriptionWhatsapp)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-lg font-bold text-white shadow-lg"
            style={{ background: '#25D366' }}
          >
            <MessageCircle size={22} /> تواصل عبر الواتساب للاشتراك
          </a>
          <p className="mt-3 text-center text-xs text-muted">بعد الدفع، سيتم تفعيل اشتراكك من إدارة المنصة مباشرة.</p>
        </div>
      </motion.div>
    </div>
  );
}
