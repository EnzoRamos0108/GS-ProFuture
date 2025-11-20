import MotionGraph from './pages/MotionGraph';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginRegister from './pages/LoginRegister';
import HomeFeed from './pages/HomeFeed';
import BuscarUsuarios from './pages/BuscarUsuarios';
import BuscarEmpresas from './pages/BuscarEmpresas';
import MinhaNetwork from './pages/MinhaNetwork';
import Perfil from './pages/Perfil';
import PerfilEmpresa from './pages/PerfilEmpresa';
import Vagas from './pages/Vagas';
import Mensagens from './pages/Mensagens';
import ChatBot from './pages/ChatBot';
import Modal from './components/Modal';
import AssistantAI from './components/AssistantAI';

const API_URL = 'http://localhost:4000/api';
const BACKEND_BASE_URL = 'http://localhost:4000';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishText, setPublishText] = useState('');
  const [publishFile, setPublishFile] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [refreshFeed, setRefreshFeed] = useState(false);

  async function uploadImageIfNeeded() {
    if (!publishFile) return null;
    const formData = new FormData();
    formData.append('imagem', publishFile);
    const res = await fetch(API_URL + '/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Erro ao fazer upload', data);
      return null;
    }
    // backend retorna algo como { url: '/uploads/arquivo.png' }
    const relativeUrl = data.url || '';
    const fullUrl = relativeUrl.startsWith('http')
      ? relativeUrl
      : BACKEND_BASE_URL + relativeUrl;
    return fullUrl;
  }

  async function handlePublish(e) {
    e.preventDefault();
    if (!publishText.trim() || !user) return;

    let imageUrl = null;
    if (publishFile) {
      imageUrl = await uploadImageIfNeeded();
    }

    // tenta usar a foto/logo real do perfil como avatar da publicação
    let autorFoto = '';
    let cargo =
      user.cargo || (user.tipoPerfil === 'empresa' ? 'Empresa' : 'Profissional do Futuro');

    try {
      if (user.tipoPerfil === 'empresa') {
        const resEmpresa = await fetch(API_URL + '/empresas/' + user.id);
        if (resEmpresa.ok) {
          const data = await resEmpresa.json();
          autorFoto = data.logo || '';
        }
      } else {
        const resProfs = await fetch(API_URL + '/profissionais/' + user.id);
        if (resProfs.ok) {
          const me = await resProfs.json();
          if (me) {
            autorFoto = me.foto || '';
            if (!user.cargo && me.cargo) {
              cargo = me.cargo;
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados para avatar do post', err);
    }

    await fetch(API_URL + '/publicacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        autorId: user.id,
        autorNome: user.nome,
        autorFoto,
        cargo,
        texto: publishText,
        imagem: imageUrl
      })
    });

    setPublishText('');
    setPublishFile(null);
    setPublishOpen(false);
    setRefreshFeed(prev => !prev);
  }


    return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100 pb-10">
      {user && (
        <Navbar
          onOpenPublishModal={() => setPublishOpen(true)}
          onSearchChange={setGlobalSearch}
        />
      )}

      {user && <div className="h-16" />}

      <main className="max-w-6xl mx-auto px-4 pt-6">
                <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/home" replace /> : <LoginRegister />}
          />
          <Route
            path="/"
            element={
              user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <HomeFeed refresh={refreshFeed} />
              </PrivateRoute>
            }
          />
          <Route
            path="/buscar"
            element={
              <PrivateRoute>
                <BuscarUsuarios globalSearch={globalSearch} />
              </PrivateRoute>
            }
          />
          <Route
            path="/network"
            element={
              <PrivateRoute>
                <MinhaNetwork />
              </PrivateRoute>
            }
          />
          <Route
            path="/atividade"
            element={
              <PrivateRoute>
                <MotionGraph />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Perfil />
              </PrivateRoute>
            }
          />
          <Route
            path="/empresas"
            element={
              <PrivateRoute>
                <BuscarEmpresas />
              </PrivateRoute>
            }
          />
          <Route
            path="/empresa/:id"
            element={
              <PrivateRoute>
                <PerfilEmpresa />
              </PrivateRoute>
            }
          />
          <Route
            path="/vagas"
            element={
              <PrivateRoute>
                <Vagas />
              </PrivateRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <PrivateRoute>
                <ChatBot />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
            path="/mensagens"
            element={
              <PrivateRoute>
                <Mensagens />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>

      <Modal
        open={publishOpen}
        title="Compartilhar um insight sobre o futuro do trabalho"
        onClose={() => setPublishOpen(false)}
      >
        <form className="space-y-4" onSubmit={handlePublish}>
          <textarea
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm"
            rows={4}
            placeholder="Quais habilidades, tecnologias ou propósitos estão guiando sua carreira?"
            value={publishText}
            onChange={e => setPublishText(e.target.value)}
          />
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Imagem da publicação (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setPublishFile(e.target.files && e.target.files[0])}
              className="w-full text-xs text-slate-300 file:text-xs file:px-3 file:py-1.5 file:rounded-full file:border-0 file:bg-neonlime-400 file:text-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPublishOpen(false)}
              className="px-3 py-1.5 text-sm rounded-full border border-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm rounded-full bg-neonlime-400 text-slate-900 font-semibold"
            >
              Publicar
            </button>
          </div>
        </form>
      </Modal>
      <AssistantAI />
    </div>
  );
}
