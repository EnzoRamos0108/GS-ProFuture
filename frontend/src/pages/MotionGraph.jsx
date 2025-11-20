import React, { useEffect, useState } from 'react';

export default function MotionGraph() {
  const [mean, setMean] = useState(null);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('http://localhost:5001/stats');

        if (!res.ok) {
          throw new Error(`Erro ao buscar /stats: ${res.status}`);
        }

        const data = await res.json();
        setMean(data.mean);
        setCount(data.count);
        setTarget(data.target ?? 0.7);
      } catch (e) {
        console.error(e);
        setError(
          'Não foi possível carregar o resumo numérico da atividade. ' +
          'Se o gráfico ainda estiver aparecendo, o backend Python está ok.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const isHealthy = mean !== null && mean >= target;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* bloco principal com texto + cards */}
      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4 space-y-4">
        <header>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
            Atividade física - pulseira inteligente
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Este painel mostra a intensidade dos seus movimentos (accelMag) medida pela pulseira,
            comparando sua média recente com uma meta de atividade saudável. Abaixo você vê um
            resumo numérico e, em seguida, o gráfico detalhado em tela cheia.
          </p>
        </header>

        {loading && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Carregando resumo da atividade...
          </p>
        )}

        {!loading && error && (
          <p className="text-xs text-amber-500">
            {error}
          </p>
        )}

        {/* Cards de resumo */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Média do usuário (accelMag)
            </p>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {mean !== null ? `${mean.toFixed(2)} g` : '—'}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Meta saudável
            </p>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {target.toFixed(2)} g
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Leituras consideradas
            </p>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {count}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Classificação
            </p>
            {mean === null ? (
              <p className="text-base font-semibold text-slate-400 dark:text-slate-500">
                Aguardando dados...
              </p>
            ) : isHealthy ? (
              <p className="text-base font-semibold text-neonlime-400">
                Ativo e dentro da meta
              </p>
            ) : (
              <p className="text-base font-semibold text-amber-400">
                Abaixo da meta saudável
              </p>
            )}
          </div>
        </div>
      </div>

      {/* gráfico FORA do card, ocupando largura total */}
      <section className="mt-6 space-y-2">
        

        {/* sem card, só o iframe grande */}
        <div className="w-full">
          <iframe
            title="Gráfico de atividade da pulseira"
            src="http://localhost:5001/"
            style={{
              width: '100%',
              height: '480px',   // aumenta o tamanho de visualização
              border: 'none',
              borderRadius: '12px',
              backgroundColor: '#020617',
            }}
          />
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded-full bg-[#a3e635]" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              Intensidade dos movimentos
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded-full bg-slate-400" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              Média do usuário
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-0.5 rounded-full bg-slate-300" />
            <span className="text-[11px] text-slate-600 dark:text-slate-300">
              Meta saudável
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
