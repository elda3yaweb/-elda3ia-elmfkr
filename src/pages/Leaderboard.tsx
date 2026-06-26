import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { useState } from 'react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import SearchBar from '../components/SearchBar';

export default function Leaderboard() {
  const { currentUser, results, activeCompetition } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  if (!currentUser) { navigate('/auth'); return null; }

  // aggregate best score per contestant within active competition
  const map = new Map<string, { name: string; best: number; count: number; totalPercent: number }>();
  results
    .filter((r) => r.competition === activeCompetition)
    .forEach((r) => {
      const cur = map.get(r.contestantId) || { name: r.contestantName, best: 0, count: 0, totalPercent: 0 };
      cur.best = Math.max(cur.best, r.percent);
      cur.count += 1;
      cur.totalPercent += r.percent;
      map.set(r.contestantId, cur);
    });

  const fullBoard = Array.from(map.entries())
    .map(([id, v]) => ({ id, ...v, avg: Math.round(v.totalPercent / v.count) }))
    .sort((a, b) => b.best - a.best || b.avg - a.avg)
    .slice(0, 50);
  const sq = search.trim().toLowerCase();
  const board = sq ? fullBoard.filter((p) => p.name.toLowerCase().includes(sq)) : fullBoard;

  const rankIcon = (i: number) =>
    i === 0 ? <Crown className="text-yellow-500" size={26} /> :
    i === 1 ? <Medal className="text-stone-400" size={24} /> :
    i === 2 ? <Medal className="text-amber-700" size={24} /> :
    <span className="font-display text-lg font-bold text-muted">{i + 1}</span>;

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><Trophy size={26} /></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">لوحة الشرف</h1>
            <p className="text-muted">أفضل المتسابقين في: <span className="font-bold text-primary">{activeCompetition}</span></p>
          </div>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="ابحث باسم المتسابق..." />

        {board.length === 0 ? (
          <div className="rounded-2xl surface-card p-12 text-center text-muted">لا توجد نتائج بعد. كن أول المتصدرين!</div>
        ) : (
          <>
            {/* podium */}
            {!sq && board.length >= 3 && (
              <div className="mb-8 grid grid-cols-3 items-end gap-3">
                {[board[1], board[0], board[2]].map((p, i) => {
                  const realRank = i === 1 ? 0 : i === 0 ? 1 : 2;
                  const h = realRank === 0 ? 'h-36' : realRank === 1 ? 'h-28' : 'h-24';
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="mb-2">{rankIcon(realRank)}</div>
                      <p className="mb-2 max-w-full truncate text-center text-sm font-bold">{p.name.split(' ').slice(0, 2).join(' ')}</p>
                      <div className={`flex w-full ${h} flex-col items-center justify-center rounded-t-2xl ${realRank === 0 ? 'btn-primary glow' : 'surface-card'}`}>
                        <Award size={24} className={realRank === 0 ? 'text-white' : 'text-primary'} />
                        <span className={`font-display text-2xl font-extrabold ${realRank === 0 ? 'text-white' : 'text-primary'}`}>{p.best}%</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              {board.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 rounded-2xl p-4 ${p.id === currentUser.id ? 'btn-primary' : 'surface-card'}`}
                >
                  <div className="grid h-10 w-10 place-items-center">{rankIcon(i)}</div>
                  <div className="flex-1">
                    <p className={`font-bold ${p.id === currentUser.id ? 'text-white' : ''}`}>{p.name} {p.id === currentUser.id && '(أنت)'}</p>
                    <p className={`text-xs ${p.id === currentUser.id ? 'text-white/80' : 'text-muted'}`}>{p.count} اختبار · المتوسط {p.avg}%</p>
                  </div>
                  <div className={`font-display text-2xl font-extrabold ${p.id === currentUser.id ? 'text-white' : 'text-primary'}`}>{p.best}%</div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
