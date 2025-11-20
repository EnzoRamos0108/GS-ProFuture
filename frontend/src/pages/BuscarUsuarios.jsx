import { useEffect, useState } from 'react';
import UserCard from '../components/UserCard';
import { useNetwork } from '../context/NetworkContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000/api';

export default function BuscarUsuarios({ globalSearch }) {
  const [users, setUsers] = useState([]);
  const [localQuery, setLocalQuery] = useState('');
  const { connect, disconnect, isConnected } = useNetwork();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const res = await fetch(API_URL + '/profissionais');
      const data = await res.json();
      // remove duplicados por id
      const unique = [];
      const seen = new Set();
      for (const u of data) {
        if (!seen.has(u.id)) {
          seen.add(u.id);
          unique.push(u);
        }
      }
      setUsers(unique);
    }
    load();
  }, []);

  const query = (globalSearch || localQuery || '').toLowerCase();

  const filtered = users.filter(u => {
    // não listar o próprio usuário logado
    if (authUser && u.id === authUser.id) return false;
    if (!query) return true;
    const target = [
      u.nome,
      u.cargo,
      u.area,
      ...(u.habilidadesTecnicas || []),
      ...(u.softSkills || [])
    ]
      .join(' ')
      .toLowerCase();
    return target.includes(query);
  });

  function handleViewProfile(user) {
    navigate('/perfil', { state: { userId: user.id } });
  }

  function handleToggleConnect(user) {
    if (authUser && user.id === authUser.id) return; // não conectar consigo mesmo
    if (isConnected(user.id)) disconnect(user.id);
    else connect(user);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold">Buscar profissionais</h2>
        <input
          type="text"
          value={localQuery}
          onChange={e => setLocalQuery(e.target.value)}
          placeholder="Filtrar por área, tecnologia..."
          className="w-56 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-3 py-1 text-xs text-slate-900 dark:text-slate-100"
         onError={e=>{e.currentTarget.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome)}&background=0f172a&color=facc15`}} />
      </div>

      <div className="grid gap-3">
        {filtered.map(u => (
          <UserCard
            key={u.id}
            user={u}
            connected={isConnected(u.id)}
            onToggleConnect={handleToggleConnect}
            onViewProfile={handleViewProfile}
           onError={e=>{e.currentTarget.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome)}&background=0f172a&color=facc15`}} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum profissional encontrado para esse filtro.
          </p>
        )}
      </div>
    </section>
  );
}
