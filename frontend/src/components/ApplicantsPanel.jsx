import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000/api';

export default function ApplicantsPanel({ empresaId, vaga }) {
  const [candidatos, setCandidatos] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_URL}/vagas/${empresaId}/${vaga.id}/candidatos`);
      if (res.ok) {
        const data = await res.json();
        setCandidatos(Array.isArray(data) ? data : []);
      }
    }
    if (empresaId && vaga?.id) load();
  }, [empresaId, vaga]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
      <div className="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100">
        Candidatos ({candidatos.length})
      </div>
      <div className="space-y-2">
        {candidatos.map((c, idx) => (
          <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <div>
              <div className="font-semibold">Profissional #{c.profissionalId}</div>
              <div className="text-[10px]">{c.nome || 'Sem nome'} • {new Date(c.ts).toLocaleString()}</div>
            </div>
          </div>
        ))}
        {candidatos.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">Nenhuma candidatura nesta vaga ainda.</p>
        )}
      </div>
    </div>
  );
}
