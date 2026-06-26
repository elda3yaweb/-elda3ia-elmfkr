import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import LibraryBrowser from '../components/LibraryBrowser';

export default function Notes() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  if (!currentUser) { navigate('/auth'); return null; }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><FileText size={26} /></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">المذكرات</h1>
            <p className="text-muted">مراجع ومذكرات منظّمة في مجلدات</p>
          </div>
        </div>
        <LibraryBrowser section="notes" />
      </div>
    </Layout>
  );
}
