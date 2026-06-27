import { type ReactNode } from 'react';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 font-display text-lg font-bold text-primary">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function Slider({ label, value, onChange, min = 0, max = 1, step = 0.01, format }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; format?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-muted">{label}</span>
        <span className="rounded-lg bg-[color-mix(in_srgb,var(--c-primary)_14%,transparent)] px-2.5 py-1 text-xs font-bold text-primary tabular-nums">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ui-slider w-full"
        style={{
          background: `linear-gradient(to left, var(--c-primary) ${pct}%, color-mix(in srgb, var(--c-text) 14%, transparent) ${pct}%)`,
        }}
      />
    </div>
  );
}

export function TextField({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl px-4 py-2.5 outline-none" />
    </label>
  );
}

export function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-xl px-4 py-2.5 outline-none" />
    </label>
  );
}

export function AreaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl px-4 py-2.5 outline-none" />
    </label>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-2.5">
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-24 rounded-lg px-2 py-1 text-sm" dir="ltr" />
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
      </div>
    </label>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-4 py-3">
      <span className="text-sm font-semibold">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 rounded-full transition ${value ? 'bg-primary' : 'bg-[color-mix(in_srgb,var(--c-text)_20%,transparent)]'}`}
        style={value ? { background: 'var(--c-primary)' } : undefined}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${value ? 'right-1' : 'right-6'}`} />
      </button>
    </label>
  );
}

export function SaveBar({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div className="sticky bottom-0 mt-6 flex items-center gap-3 border-t border-line bg-[var(--c-surface)] pt-4">
      <button onClick={onSave} className="rounded-xl btn-primary px-6 py-2.5 font-bold">حفظ التغييرات</button>
      {saved && <span className="text-sm font-semibold text-green-600">✓ تم الحفظ بنجاح</span>}
    </div>
  );
}

export function useSaved() {
  // helper hook factory not allowed inline; keep simple in components
}
