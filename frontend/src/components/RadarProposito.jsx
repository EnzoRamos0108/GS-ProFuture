import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function RadarProposito({ radar }) {
  const safeRadar = radar || { ods4: 5, ods8: 5, ods9: 5, ods10: 5 };

  const data = [
    { eixo: 'ODS 4 • Educação', valor: safeRadar.ods4 || 0 },
    { eixo: 'ODS 8 • Trabalho Digno', valor: safeRadar.ods8 || 0 },
    { eixo: 'ODS 9 • Inovação', valor: safeRadar.ods9 || 0 },
    { eixo: 'ODS 10 • Desigualdades', valor: safeRadar.ods10 || 0 }
  ];

  return (
    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-1 text-slate-900 dark:text-slate-100">
        Radar de Propósito & Futuro
      </h3>
      <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
        Conexão com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU:
        <br />
        <span className="block mt-1">
          <strong>ODS 4</strong>: Educação de Qualidade •{' '}
          <strong>ODS 8</strong>: Trabalho Decente e Crescimento •{' '}
          <strong>ODS 9</strong>: Indústria, Inovação e Infraestrutura •{' '}
          <strong>ODS 10</strong>: Redução das Desigualdades.
        </span>
      </p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#94a3b855" />
            <PolarAngleAxis
              dataKey="eixo"
              tick={{ fill: '#475569', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={{ fill: '#64748b', fontSize: 9 }}
              stroke="#94a3b8"
            />
            <Tooltip
              formatter={value => [`Nota: ${value}`, 'ODS']}
              contentStyle={{
                backgroundColor: '#020617',
                borderRadius: '0.5rem',
                border: '1px solid #475569',
                fontSize: '0.7rem'
              }}
            />
            <Radar
              name="Propósito"
              dataKey="valor"
              stroke="#a3e635"
              fill="#a3e635"
              fillOpacity={0.45}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
