import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000/api';

function getFallbackAvatar(nome) {
  const name = nome || 'ProFuture';
  return (
    'https://ui-avatars.com/api/?name=' +
    encodeURIComponent(name) +
    '&background=0f172a&color=facc15'
  );
}

function normalizeFotoUrl(url) {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http')) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('./')) return trimmed.replace('./', '/');
  return trimmed;
}

export default function PostCard({ post, onRefresh }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.curtidas || 0);
  const [liked, setLiked] = useState(post.likedByCurrentUser || false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editTexto, setEditTexto] = useState(post.texto || '');
  const [fotoAutor, setFotoAutor] = useState(
    post.autorFoto && post.autorFoto.trim() !== ''
      ? normalizeFotoUrl(post.autorFoto)
      : getFallbackAvatar(post.autorNome)
  );

  const isMine = user && post.autorId === user.id;

  useEffect(() => {
    async function resolveFotoAutor() {
      // se a publicação já tiver foto definida, apenas normaliza
      if (post.autorFoto && post.autorFoto.trim() !== '') {
        setFotoAutor(normalizeFotoUrl(post.autorFoto));
        return;
      }

      // tenta buscar foto do profissional
      try {
        const resProf = await fetch(`${API_URL}/profissionais/${post.autorId}`);
        if (resProf.ok) {
          const prof = await resProf.json();
          if (prof.foto && prof.foto.trim() !== '') {
            setFotoAutor(normalizeFotoUrl(prof.foto));
            return;
          }
        }
      } catch (err) {
        console.error('Erro ao buscar foto do profissional para post', err);
      }

      // fallback: avatar com iniciais
      setFotoAutor(getFallbackAvatar(post.autorNome));
    }

    resolveFotoAutor();
  }, [post.autorId, post.autorFoto, post.autorNome]);

  useEffect(() => {
    async function loadComments() {
      const res = await fetch(`${API_URL}/publicacoes/${post.id}/comentarios`);
      const data = await res.json();
      setComments(data);
    }
    loadComments();
  }, [post.id]);

  async function toggleLike() {
    if (!user) return;
    const res = await fetch(`${API_URL}/publicacoes/${post.id}/curtir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    const data = await res.json();
    setLikes(data.curtidas);
    setLiked(data.liked);
    if (onRefresh) onRefresh();
  }

  function openCommentModal() {
    setCommentOpen(true);
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await fetch(`${API_URL}/publicacoes/${post.id}/comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texto: commentText.trim(),
        autorId: user ? user.id : null,
        autorNome: user ? user.nome : 'Você'
      })
    });
    const novo = await res.json();
    setComments(prev => [...prev, novo]);
    setCommentText('');
    setCommentOpen(false);
  }

  async function handleDelete() {
    if (!window.confirm('Deseja excluir esta publicação?')) return;
    await fetch(`${API_URL}/publicacoes/${post.id}`, {
      method: 'DELETE'
    });
    if (onRefresh) onRefresh();
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editTexto.trim()) return;
    await fetch(`${API_URL}/publicacoes/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto: editTexto.trim() })
    });
    setEditOpen(false);
    if (onRefresh) onRefresh();
  }

  return (
    <article className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4 mb-3">
      <header className="flex items-center gap-3 mb-2">
        <img
          src={fotoAutor}
          alt={post.autorNome}
          className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
        />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {post.autorNome}
            </h3>
            {isMine && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                você
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            {post.cargo || 'Profissional do Futuro'}
          </p>
        </div>
      </header>

      <p className="text-sm text-slate-800 dark:text-slate-100 mb-2 whitespace-pre-wrap">
        {post.texto}
      </p>

      {post.imagem && (
        <div className="mt-2 mb-2">
          <img
            src={post.imagem}
            alt="Imagem da publicação"
            className="w-full max-h-80 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1 hover:text-neonlime-400 transition-colors"
          >
            <span className="text-base">
              {liked ? '💚' : '🤍'}
            </span>
            <span>{likes} curtidas</span>
          </button>
          <button
            onClick={openCommentModal}
            className="flex items-center gap-1 hover:text-neonlime-400 transition-colors"
          >
            <span className="text-base">💬</span>
            <span>Comentar</span>
          </button>
        </div>
        {isMine && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="text-[11px] hover:text-neonlime-400"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="text-[11px] text-red-500 hover:text-red-400"
            >
              Excluir
            </button>
          </div>
        )}
      </div>

      {comments.length > 0 && (
        <div className="mt-3 border-t border-slate-200 dark:border-slate-700 pt-2">
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-1">
            Comentários
          </p>
          <ul className="space-y-1">
            {comments.map(c => (
              <li key={c.id} className="text-[11px] text-slate-800 dark:text-slate-300">
                <span className="font-semibold">{c.autorNome}:</span> {c.texto}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal de comentário */}
      <Modal
        open={commentOpen}
        title="Comentar publicação"
        onClose={() => setCommentOpen(false)}
      >
        <form className="space-y-3" onSubmit={submitComment}>
          <textarea
            rows={3}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            placeholder="Escreva um comentário..."
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCommentOpen(false)}
              className="px-3 py-1.5 text-sm rounded-full border border-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm rounded-full bg-neonlime-400 text-slate-900 font-semibold"
            >
              Enviar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de edição de post */}
      <Modal open={editOpen} title="Editar publicação" onClose={() => setEditOpen(false)}>
        <form className="space-y-3" onSubmit={handleEdit}>
          <textarea
            rows={4}
            value={editTexto}
            onChange={e => setEditTexto(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-3 py-1.5 text-sm rounded-full border border-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm rounded-full bg-neonlime-400 text-slate-900 font-semibold"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </article>
  );
}
