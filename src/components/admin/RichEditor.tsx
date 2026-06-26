import { useRef, useEffect, useState } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3,
  Quote, Link2, Image as ImageIcon, Code, Eraser, AlignRight, AlignCenter, AlignLeft, Minus,
} from 'lucide-react';

/**
 * Rich text editor based on contentEditable + execCommand.
 * Supports: write directly, paste formatted content from elsewhere, format with toolbar,
 * insert links/images, and edit raw HTML source.
 */
export default function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showSource, setShowSource] = useState(false);
  const [source, setSource] = useState(value);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => { if (ref.current) onChange(ref.current.innerHTML); };

  const cmd = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    sync();
  };

  const addLink = () => {
    const url = prompt('أدخل رابط الصفحة:');
    if (url) cmd('createLink', url);
  };
  const addImage = () => {
    const url = prompt('أدخل رابط الصورة:');
    if (url) cmd('insertImage', url);
  };
  const heading = (tag: string) => cmd('formatBlock', tag);

  const applySource = () => {
    if (ref.current) { ref.current.innerHTML = source; onChange(source); }
    setShowSource(false);
  };
  const openSource = () => { setSource(ref.current?.innerHTML || value); setShowSource(true); };

  const Btn = ({ icon, onClick, title }: { icon: React.ReactNode; onClick: () => void; title: string }) => (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={title}
      className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-[color-mix(in_srgb,var(--c-primary)_14%,transparent)] hover:text-primary">
      {icon}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-[color-mix(in_srgb,var(--c-text)_4%,transparent)] p-1.5">
        <Btn icon={<Heading1 size={17} />} onClick={() => heading('H1')} title="عنوان كبير" />
        <Btn icon={<Heading2 size={17} />} onClick={() => heading('H2')} title="عنوان متوسط" />
        <Btn icon={<Heading3 size={17} />} onClick={() => heading('H3')} title="عنوان صغير" />
        <span className="mx-1 h-6 w-px bg-line" />
        <Btn icon={<Bold size={17} />} onClick={() => cmd('bold')} title="عريض" />
        <Btn icon={<Italic size={17} />} onClick={() => cmd('italic')} title="مائل" />
        <Btn icon={<Underline size={17} />} onClick={() => cmd('underline')} title="تسطير" />
        <span className="mx-1 h-6 w-px bg-line" />
        <Btn icon={<List size={17} />} onClick={() => cmd('insertUnorderedList')} title="قائمة نقطية" />
        <Btn icon={<ListOrdered size={17} />} onClick={() => cmd('insertOrderedList')} title="قائمة مرقمة" />
        <Btn icon={<Quote size={17} />} onClick={() => heading('BLOCKQUOTE')} title="اقتباس" />
        <span className="mx-1 h-6 w-px bg-line" />
        <Btn icon={<AlignRight size={17} />} onClick={() => cmd('justifyRight')} title="محاذاة يمين" />
        <Btn icon={<AlignCenter size={17} />} onClick={() => cmd('justifyCenter')} title="توسيط" />
        <Btn icon={<AlignLeft size={17} />} onClick={() => cmd('justifyLeft')} title="محاذاة يسار" />
        <span className="mx-1 h-6 w-px bg-line" />
        <Btn icon={<Link2 size={17} />} onClick={addLink} title="إضافة رابط" />
        <Btn icon={<ImageIcon size={17} />} onClick={addImage} title="إضافة صورة" />
        <Btn icon={<Minus size={17} />} onClick={() => cmd('insertHorizontalRule')} title="خط فاصل" />
        <span className="mx-1 h-6 w-px bg-line" />
        <Btn icon={<Eraser size={17} />} onClick={() => cmd('removeFormat')} title="مسح التنسيق" />
        <Btn icon={<Code size={17} />} onClick={openSource} title="تحرير HTML" />
      </div>

      {/* editable area */}
      {!showSource ? (
        <div
          ref={ref}
          contentEditable
          onInput={sync}
          onBlur={sync}
          dir="rtl"
          className="article-content min-h-[260px] max-h-[460px] overflow-y-auto bg-[var(--c-surface)] p-5 outline-none"
          style={{ lineHeight: 2 }}
          suppressContentEditableWarning
        />
      ) : (
        <div className="bg-[var(--c-surface)] p-3">
          <p className="mb-2 text-xs text-muted">يمكنك لصق كود HTML هنا (من مدونة أو محرر آخر) ثم اضغط تطبيق:</p>
          <textarea value={source} onChange={(e) => setSource(e.target.value)} rows={12} dir="ltr" className="w-full rounded-xl px-3 py-2 font-mono text-xs outline-none" />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={applySource} className="rounded-lg btn-primary px-4 py-1.5 text-sm font-bold">تطبيق</button>
            <button type="button" onClick={() => setShowSource(false)} className="rounded-lg border border-line px-4 py-1.5 text-sm font-bold">إلغاء</button>
          </div>
        </div>
      )}
      <p className="border-t border-line bg-[color-mix(in_srgb,var(--c-text)_4%,transparent)] px-4 py-1.5 text-xs text-muted">
        💡 تقدر تكتب مباشرة، أو تنسخ محتوى منسّق من مكان تاني وتلصقه هنا، والتنسيق هيتحفظ.
      </p>
    </div>
  );
}
