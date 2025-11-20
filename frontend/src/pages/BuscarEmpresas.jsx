import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '../context/NetworkContext';
import { useAuth } from '../context/AuthContext';
import { HARD_SKILLS_SOFTWARE } from '../constants/hardSkills';

const API_URL = 'http://localhost:4000/api';

export default function BuscarEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [query, setQuery] = useState('');
  const [userSkills, setUserSkills] = useState([]);
  const { followedCompanies, followCompany, unfollowCompany, isFollowingCompany } =
    useNetwork();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEmpresas() {
      try {
        const res = await fetch(API_URL + '/empresas');
        const data = await res.json();
        setEmpresas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar empresas', err);
      }
    }
    loadEmpresas();
  }, []);

  useEffect(() => {
    async function loadUserSkills() {
      if (!user || user.tipoPerfil === 'empresa') return;
      try {
        const res = await fetch(API_URL + '/profissionais/' + user.id);
        if (!res.ok) return;
        const data = await res.json();
        let skills = [];
        if (Array.isArray(data.habilidadesTecnicas)) {
          skills = data.habilidadesTecnicas;
        } else if (typeof data.habilidadesTecnicas === 'string') {
          skills = data.habilidadesTecnicas.split(',').map(s => s.trim());
        }
        const normalized = skills
          .map(s => s.toLowerCase().trim())
          .filter(Boolean);
        setUserSkills(normalized);
      } catch (err) {
        console.error('Erro ao carregar hard skills do usuário', err);
      }
    }
    loadUserSkills();
  }, [user]);



  const recommended = empresas.filter(e => {
    if (!user || user.tipoPerfil === 'empresa' || userSkills.length === 0) {
      return false;
    }
    const interesses = Array.isArray(e.hardSkillsInteresse)
      ? e.hardSkillsInteresse
      : [];
    const normalized = interesses.map(s => s.toLowerCase().trim());
    return normalized.some(s => userSkills.includes(s));
  });

  const filtered = empresas.filter(e => {
    if (!query.trim()) return true;
    const target = (
      (e.nome || '') +
      ' ' +
      (e.localizacao || '') +
      ' ' +
      (e.sobre || '')
    )
      .toLowerCase();
    return target.includes(query.toLowerCase());
  });

  function handleViewProfile(id) {
    navigate(`/empresa/${id}`);
  }

  function handleToggleFollow(empresa) {
    if (isFollowingCompany(empresa.id)) {
      unfollowCompany(empresa.id);
    } else {
      followCompany(empresa);
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold">Buscar empresas</h2>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nome, localização ou área..."
          className="w-64 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(e => {
          const following = isFollowingCompany(e.id);
          const logoUrl =
            e.logo ||
            'https://ui-avatars.com/api/?name=' +
              encodeURIComponent(e.nome || 'Empresa') +
              '&background=020617&color=e5e7eb';
          return (
            <div
              key={e.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex gap-3 items-center"
            >
              <img
                src={logoUrl}
                alt={e.nome}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-600"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {e.nome}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {e.localizacao || 'Localização não informada'}
                </div>
                {e.site && (
                  <a
                    href={e.site}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-neonlime-400 hover:underline"
                  >
                    {e.site}
                  </a>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleViewProfile(e.id)}
                  className="text-[11px] px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Ver perfil
                </button>
                <button
                  onClick={() => handleToggleFollow(e)}
                  className={
                    'text-[11px] px-3 py-1 rounded-full border ' +
                    (following
                      ? 'border-red-500/60 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
                      : 'border-neonlime-400 text-neonlime-400 hover:bg-neonlime-400/10')
                  }
                >
                  {following ? 'Parar de seguir' : 'Seguir'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
          Nenhuma empresa encontrada para esse filtro.
        </p>
      )}
    </section>
  );
}
