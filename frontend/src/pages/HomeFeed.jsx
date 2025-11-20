import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000/api';

export default function HomeFeed({ refresh }) {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  async function load() {
    if (!user) return;
    const url = API_URL + '/publicacoes?userId=' + user.id;
    const res = await fetch(url);
    const data = await res.json();
    setPosts(data);
  }

  useEffect(() => {
    load();
  }, [refresh, user]);

  return (
    <section className="grid md:grid-cols-[2fr,1fr] gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Feed de publicações
        </h2>
        {posts.map(post => (
          <PostCard key={post.id} post={post} onRefresh={load} />
        ))}
      </div>

      <aside className="hidden md:block">
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-sm">
          <h3 className="font-semibold mb-2 text-neonlime-400">
            O Futuro do Trabalho
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            Compartilhe reflexões sobre IA, novas competências, educação contínua
            e trabalhos guiados por propósito.
          </p>
        </div>
      </aside>
    </section>
  );
}
