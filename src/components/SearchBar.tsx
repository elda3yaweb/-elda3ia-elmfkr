import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'ابحث في هذا القسم...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-2 rounded-2xl surface-card px-4 py-2.5 shadow-sm focus-within:ring-2 ring-primary">
      <Search size={18} className="shrink-0 text-primary" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none"
      />
      {value && (
        <button onClick={() => onChange('')} title="مسح" className="shrink-0 text-muted hover:text-primary">
          <X size={18} />
        </button>
      )}
    </div>
  );
}
