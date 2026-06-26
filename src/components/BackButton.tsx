import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function BackButton({ to, label = 'رجوع' }: { to?: string; label?: string }) {
  const navigate = useNavigate();
  const go = () => {
    if (to) navigate(to);
    else if (window.history.length > 1) navigate(-1);
    else navigate('/home');
  };
  return (
    <button
      onClick={go}
      className="mb-5 inline-flex items-center gap-2 rounded-xl surface-card px-4 py-2 text-sm font-bold text-primary transition hover:-translate-x-0.5 hover:shadow-md"
    >
      <ArrowRight size={18} /> {label}
    </button>
  );
}
