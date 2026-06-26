import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import LibraryBrowser from '../components/LibraryBrowser';

export default function Articles() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  if (!currentUser) { navigate('/auth'); return null; }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><BookOpen size={26} /></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">الشرح</h1>
            <p className="text-muted">شروحات ومقالات منظّمة في مجلدات</p>
          </div>
        </div>
        <LibraryBrowser section="articles" />
      </div>
    </Layout>
  );
}
