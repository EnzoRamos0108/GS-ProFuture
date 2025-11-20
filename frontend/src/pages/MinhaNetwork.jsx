import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function MinhaNetwork() {
  const { connections, followedCompanies, unfollowCompany } = useNetwork();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const cardBase = 'rounded-xl p-4 flex gap-3 border ';
  const cardTheme =
    theme === 'dark'
      ? 'bg-slate-800 border-slate-700'
      : 'bg-white border-slate-200';

  function handleViewProfile(id) {
    navigate('/perfil', { state: { userId: id } });
  }

  function handleViewCompany(id) {
    navigate(`/empresa/${id}`);
  }

  return (
    <section className="max-w-4xl mx-auto px-4 pt-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Minha Network</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Acompanhe as conexões profissionais e empresas que você está seguindo.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">
            Conexões
          </h3>
          {connections.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Você ainda não se conectou com nenhum profissional.
            </p>
          )}
          <div className="space-y-3">
            {connections.map(c => (
              <div key={c.id} className={cardBase + cardTheme}>
                <img
                  src={c.foto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.nome || 'ProFuture')}
                  alt={c.nome}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {c.nome}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {c.cargo} • {c.area}
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewProfile(c.id)}
                      className="text-[11px] px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Ver perfil
                    </button>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Conectado com você no ProFuture.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">
            Empresas seguidas
          </h3>
          {(!followedCompanies || followedCompanies.length === 0) && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Você ainda não está seguindo nenhuma empresa. Explore a aba &quot;Buscar empresas&quot; para começar.
            </p>
          )}
          <div className="space-y-3">
            {followedCompanies &&
              followedCompanies.map(e => (
                <div key={e.id} className={cardBase + cardTheme}>
                  <img
                    src={
                      e.logo ||
                      'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(e.nome || 'Empresa') +
                        '&background=020617&color=e5e7eb'
                    }
                    alt={e.nome}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {e.nome}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {e.localizacao || 'Localização não informada'}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => handleViewCompany(e.id)}
                          className="text-[11px] px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          Ver perfil
                        </button>
                        <button
                          onClick={() => unfollowCompany(e.id)}
                          className="text-[11px] px-3 py-1 rounded-full text-red-500 border border-red-500/60 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          Parar de seguir
                        </button>
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Acompanhando atualizações desta empresa.
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
