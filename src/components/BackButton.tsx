import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function BackButton({ to }: { to?: string }) {
  const navigate = useNavigate();
  const goBack = () => {
    if (to) navigate(to);
    else if (window.history.length > 1) navigate(-1);
    else navigate('/home');
  };
  return (
    <button
      onClick={goBack}
      className="mb-5 inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold text-muted transition hover:border-primary hover:text-primary"
    >
      <ArrowRight size={18} /> رجوع
    </button>
  );
}
