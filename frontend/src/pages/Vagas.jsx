import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000/api';

export default function Vagas() {
  const [empresas, setEmpresas] = useState([]);
  const [query, setQuery] = useState('');
  const [userSkills, setUserSkills] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function loadEmpresas() {
      try {
        const res = await fetch(API_URL + '/empresas');
        const data = await res.json();
        setEmpresas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar vagas das empresas', err);
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
        console.error('Erro ao carregar hard skills do usuário para vagas', err);
      }
    }
    loadUserSkills();
  }, [user]);

  const allVagas = useMemo(() => {
    const all = [];
    empresas.forEach(empresa => {
      (empresa.vagas || []).forEach(v => {
        all.push({
          ...v,
          empresaId: empresa.id,
          empresaNome: empresa.nome,
          empresaLocalizacao: empresa.localizacao
        });
      });
    });
    return all;
  }, [empresas]);

  const vagas = useMemo(() => {
    if (!query.trim()) return allVagas;
    const q = query.toLowerCase();
    return allVagas.filter(v => {
      const alvo =
        (v.titulo || '') +
        ' ' +
        (v.empresaNome || '') +
        ' ' +
        (v.empresaLocalizacao || '') +
        ' ' +
        (v.descricao || '') +
        ' ' +
        (v.competencias || '');
      return alvo.toLowerCase().includes(q);
    });
  }, [allVagas, query]);

  const recommended = useMemo(() => {
    if (!user || user.tipoPerfil === 'empresa' || userSkills.length === 0) {
      return [];
    }
    return allVagas.filter(v => {
      const hs = Array.isArray(v.hardSkills) ? v.hardSkills : [];
      const normalized = hs.map(s => s.toLowerCase().trim());
      return normalized.some(s => userSkills.includes(s));
    });
  }, [allVagas, user, userSkills]);

  const vagasRestantes = useMemo(() => {
    if (!vagas || vagas.length === 0) return [];
    const recKeys = new Set(
      recommended.map(v => `${v.id}-${v.empresaId}`)
    );
    return vagas.filter(
      v => !recKeys.has(`${v.id}-${v.empresaId}`)
    );
  }, [vagas, recommended]);

  function handleVerEmpresa(v) {
    navigate(`/empresa/${v.empresaId}`);
  }

  return (
    <section className="max-w-5xl mx-auto px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Vagas abertas
        </h2>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por cargo, empresa ou localização..."
          className="w-64 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="mb-6 space-y-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Vagas com base no seu perfil
        </h3>
        {(!user || user.tipoPerfil === 'empresa') && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Faça login como profissional e defina suas hard skills para ver vagas recomendadas.
          </p>
        )}
        {user && user.tipoPerfil !== 'empresa' && userSkills.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adicione hard skills ao seu perfil para receber recomendações de vagas alinhadas ao seu perfil.
          </p>
        )}
        {user && user.tipoPerfil !== 'empresa' && userSkills.length > 0 && recommended.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ainda não encontramos vagas compatíveis com as suas hard skills. Assim que novas vagas forem criadas, elas aparecerão aqui.
          </p>
        )}
        <div className="space-y-3">
          {recommended.map(v => (
            <div
              key={'rec-' + v.id + '-' + v.empresaId}
              className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-50">
                    {v.titulo}
                  </div>
                  <div className="text-xs text-slate-400">
                    {v.empresaNome} • {v.localizacao || v.empresaLocalizacao || 'Localização não informada'}
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-neonlime-400 text-[10px] text-neonlime-400">
                      Recomendado para você
                    </span>
                  </div>
                </div>
                {v.modalidade && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-500 text-slate-200">
                    {v.modalidade}
                  </span>
                )}
              </div>
              {v.descricao && (
                <p className="text-xs text-slate-300 line-clamp-3">
                  {v.descricao}
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>
                  {v.salario ? `Faixa salarial: ${v.salario}` : 'Salário a combinar'}
                </span>
                <button
                  onClick={() => handleVerEmpresa(v)}
                  className="px-3 py-1 rounded-full border border-neonlime-400 text-neonlime-400 hover:bg-neonlime-400/10"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {vagasRestantes.length === 0 && allVagas.length === 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Nenhuma vaga publicada ainda. Volte mais tarde para conferir novas oportunidades.
        </p>
      )}

      {vagasRestantes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Outras vagas
          </h3>
          <div className="space-y-3">
            {vagasRestantes.map(v => (
              <div
                key={v.id + '-' + v.empresaId}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {v.titulo}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {v.empresaNome} • {v.localizacao || v.empresaLocalizacao || 'Localização não informada'}
                    </div>
                  </div>
                  {v.modalidade && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                      {v.modalidade}
                    </span>
                  )}
                </div>
                {v.descricao && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                    {v.descricao}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>
                    {v.salario ? `Faixa salarial: ${v.salario}` : 'Salário a combinar'}
                  </span>
                  <button
                    onClick={() => handleVerEmpresa(v)}
                    className="px-3 py-1 rounded-full border border-neonlime-400 text-neonlime-400 hover:bg-neonlime-400/10"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
