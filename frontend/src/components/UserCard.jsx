import { useTheme } from '../context/ThemeContext';

function getFoto(user) {
  if (user.foto && user.foto.trim() !== '') {
    const f = user.foto;
    if (f.startsWith('http')) return f;
    if (f.startsWith('/')) return f;
    if (f.startsWith('./')) return f.replace('./', '/');
    return f;
  }
  const nome = user.nome || 'ProFuture';
  return (
    'https://ui-avatars.com/api/?name=' +
    encodeURIComponent(nome) +
    '&background=0f172a&color=facc15'
  );
}

export default function UserCard({ user, connected, onToggleConnect, onViewProfile }) {
  const { theme } = useTheme();
  const cardBase = 'rounded-xl p-4 flex gap-3 border ';
  const cardTheme =
    theme === 'dark'
      ? 'bg-slate-800 border-slate-700'
      : 'bg-white border-slate-200';

  const foto = getFoto(user);

  return (
    <div className={cardBase + cardTheme}>
      <img
        src={foto}
        alt={user.nome}
        className="w-12 h-12 rounded-full object-cover border border-slate-300 dark:border-slate-600"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {user.nome}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {user.cargo} • {user.area}
            </div>
          </div>
          {onToggleConnect && (
            <button
              onClick={() => onToggleConnect(user)}
              className={
                'px-3 py-1 rounded-full font-semibold text-xs ' +
                (connected
                  ? 'bg-transparent border border-neonlime-400 text-neonlime-400'
                  : 'bg-neonlime-400 text-slate-900')
              }
            >
              {connected ? 'Conectado' : 'Conectar'}
            </button>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
          {user.resumo}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {(user.habilidadesTecnicas || []).slice(0, 3).map(skill => (
              <span
                key={skill}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
          {onViewProfile && (
            <button
              onClick={() => onViewProfile(user)}
              className="text-[11px] text-neonlime-400 hover:text-neonlime-300"
            >
              Ver perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
