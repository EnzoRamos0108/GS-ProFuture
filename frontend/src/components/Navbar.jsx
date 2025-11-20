import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import claroLogo from '../assets/claroLogo_.png';
import escuroLogo from '../assets/escuroLogo_.png';

function IconHome(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6.5 10.5V20h11v-9.5" />
    </svg>
  );
}

function IconSearch(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 3.5 3.5" />
    </svg>
  );
}

function IconBot(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={props.className || 'w-4 h-4'}
    >
      <rect
        x="4"
        y="7"
        width="16"
        height="11"
        rx="3"
        className="fill-none stroke-current"
        strokeWidth="1.5"
      />
      <circle cx="9" cy="12" r="1.3" className="fill-current" />
      <circle cx="15" cy="12" r="1.3" className="fill-current" />
      <rect
        x="10"
        y="4"
        width="4"
        height="2"
        rx="1"
        className="fill-none stroke-current"
        strokeWidth="1.5"
      />
      <line
        x1="12"
        y1="2"
        x2="12"
        y2="4"
        className="stroke-current"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconBriefcase(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 9.5A2.5 2.5 0 0 1 5.5 7h13A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-7Z" />
      <path d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7" />
      <path d="M3 12h18" />
    </svg>
  );
}

function IconChat(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-5.5L9 20.5V16H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M8 10h8" />
      <path d="M8 13h4" />
    </svg>
  );
}

function IconPaperPlane(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function IconUsers(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="9" r="3" />
      <path d="M4 19a4 4 0 0 1 4-4h2" />
      <path d="M14 15h2a4 4 0 0 1 4 4" />
    </svg>
  );
}

function IconUser(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="9" r="3.2" />
      <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

function IconLogout(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 5v-1.5a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 0 6 3.5v17A1.5 1.5 0 0 0 7.5 22h6A1.5 1.5 0 0 0 15 20.5V19" />
      <path d="M10 12h10" />
      <path d="m17 9 3 3-3 3" />
    </svg>
  );
}

function IconSun(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v2.2M12 18.8V21M4.6 4.6 6.2 6.2M17.8 17.8l1.6 1.6M3 12h2.2M18.8 12H21M4.6 19.4 6.2 17.8M17.8 6.2 19.4 4.6" />
    </svg>
  );
}

function IconMoon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 14.5A7.5 7.5 0 0 1 11.5 6 5.5 5.5 0 1 0 20 14.5Z" />
    </svg>
  );
}

export default function Navbar({ onOpenPublishModal, onSearchChange }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  function handleSearchChange(e) {
    const value = e.target.value;
    setQuery(value);
    if (onSearchChange) onSearchChange(value);
  }

  function go(path) {
    if (path === '/perfil' && user && user.tipoPerfil === 'empresa') {
      navigate(`/empresa/${user.id}`);
      setIsMobileMenuOpen(false);
      return;
    }
    navigate(path);
    setIsMobileMenuOpen(false);
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen(prev => !prev);
  }

  const isActive = path => location.pathname === path;

  return (
    <header className="sticky top-0 z-30 bg-slate-100/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-6">
        {/* Logo + busca */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => go('/home')}
            className="flex items-center gap-2"
          >
            <img
              src={theme === 'dark' ? escuroLogo : claroLogo}
              alt="ProFuture"
              className="w-10 h-10 object-contain"
            />
            <span className="hidden sm:block font-semibold tracking-tight text-slate-900 dark:text-slate-100 text-base">
              ProFuture
            </span>
          </button>

          <div className="hidden sm:flex flex-1">
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Buscar pessoas, skills ou áreas..."
              className="w-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Navegação central */}
        <nav className="hidden sm:flex items-center gap-5">
          <button
            onClick={() => go('/home')}
            className="flex flex-col items-center text-[11px] text-slate-500 dark:text-slate-400 hover:text-neonlime-400"
          >
            <IconHome
              className={
                'w-6 h-6 ' +
                ((location.pathname === '/' || location.pathname === '/home')
                  ? 'text-neonlime-400'
                  : '')
              }
            />
            <span
              className={
                (location.pathname === '/' || location.pathname === '/home')
                  ? 'text-neonlime-400 mt-1'
                  : 'mt-1'
              }
            >
              Home
            </span>
          </button>

          <button
            onClick={() => go('/buscar')}
            className="hidden sm:flex flex-col items-center text-[11px] text-slate-500 dark:text-slate-400 hover:text-neonlime-400"
          >
            <IconSearch
              className={
                'w-6 h-6 ' +
                (isActive('/buscar') ? 'text-neonlime-400' : '')
              }
            />
            <span
              className={
                isActive('/buscar') ? 'text-neonlime-400 mt-1' : 'mt-1'
              }
            >
              Buscar
            </span>
          </button>

          <button
            onClick={() => go('/empresas')}
            className="hidden sm:flex flex-col items-center text-[11px] text-slate-500 dark:text-slate-400 hover:text-neonlime-400"
          >
            <IconUsers
              className={
                'w-6 h-6 ' +
                (isActive('/empresas') ? 'text-neonlime-400' : '')
              }
            />
            <span
              className={
                isActive('/empresas') ? 'text-neonlime-400 mt-1' : 'mt-1'
              }
            >
              Empresas
            </span>
          </button>

          <button
            onClick={() => go('/vagas')}
            className="hidden sm:flex flex-col items-center text-[11px] text-slate-500 dark:text-slate-400 hover:text-neonlime-400"
          >
            <IconBriefcase
              className={
                'w-6 h-6 ' + (isActive('/vagas') ? 'text-neonlime-400' : '')
              }
            />
            <span
              className={isActive('/vagas') ? 'text-neonlime-400 mt-1' : 'mt-1'}
            >
              Vagas
            </span>
          </button>

          <button
            onClick={() => go('/chatbot')}
            className="hidden sm:flex flex-col items-center text-[11px] text-slate-500 dark:text-slate-400 hover:text-neonlime-400"
          >
            <IconBot
              className={
                'w-6 h-6 ' +
                (isActive('/chatbot') ? 'text-neonlime-400' : '')
              }
            />
            <span
              className={
                isActive('/chatbot') ? 'text-neonlime-400 mt-1' : 'mt-1'
              }
            >
              Chatbot
            </span>
          </button>

          <button
            onClick={() => go('/mensagens')}
            className="hidden sm:flex flex-col items-center text-[11px] text-slate-500 dark:text-slate-400 hover:text-neonlime-400"
          >
            <IconPaperPlane
              className={
                'w-6 h-6 ' +
                (isActive('/mensagens') ? 'text-neonlime-400' : '')
              }
            />
            <span
              className={
                isActive('/mensagens') ? 'text-neonlime-400 mt-1' : 'mt-1'
              }
            >
              Mensagens
            </span>
          </button>

          <button
            onClick={() => go('/network')}
            className="hidden sm:flex flex-col items-center text-[11px] text-slate-500 dark:text-slate-400 hover:text-neonlime-400"
          >
            <IconUsers
              className={
                'w-6 h-6 ' +
                (isActive('/network') ? 'text-neonlime-400' : '')
              }
            />
            <span
              className={
                isActive('/network') ? 'text-neonlime-400 mt-1' : 'mt-1'
              }
            >
              Network
            </span>
          </button>

          <button
            onClick={() => go('/perfil')}
            className="hidden sm:flex flex-col items-center text-[11px] text-slate-500 dark:text-slate-400 hover:text-neonlime-400"
          >
            <IconUser
              className={
                'w-6 h-6 ' + (isActive('/perfil') ? 'text-neonlime-400' : '')
              }
            />
            <span
              className={
                isActive('/perfil') ? 'text-neonlime-400 mt-1' : 'mt-1'
              }
            >
              Perfil
            </span>
          </button>
        </nav>

        {/* Ações à direita */}
        <div className="flex items-center gap-4">
          {/* Botão menu mobile */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="sm:hidden inline-flex items-center justify-center rounded-full p-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200"
            aria-label="Abrir menu"
          >
            <span className="sr-only">Abrir menu</span>
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>

          {/* Switch de tema minimalista */}
          <button
            type="button"
            onClick={toggleTheme}
            className="relative inline-flex items-center h-8 w-16 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-600"
          >
            <span className="absolute left-1.5 text-slate-500 dark:text-slate-300">
              <IconSun className="w-3.5 h-3.5" />
            </span>
            <span className="absolute right-1.5 text-slate-400 dark:text-slate-200">
              <IconMoon className="w-3.5 h-3.5" />
            </span>
            <span
              className={
                'inline-block h-5 w-5 rounded-full bg-white dark:bg-slate-900 shadow transform transition-transform ' +
                (theme === 'dark' ? 'translate-x-8' : 'translate-x-0')
              }
            />
          </button>

          <button
            onClick={onOpenPublishModal}
            className="hidden sm:inline-flex items-center gap-1 px-4 py-2 text-xs rounded-full bg-neonlime-400 text-slate-900 font-semibold hover:bg-neonlime-300"
          >
            Publicar
          </button>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <IconLogout className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>


      {/* Navegação em telas pequenas */}
      {isMobileMenuOpen && (
        <nav className="sm:hidden px-4 pb-3">
          <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <button
              onClick={() => go('/home')}
              className="flex flex-col items-center hover:text-neonlime-400"
            >
              <IconHome
                className={
                  'w-6 h-6 ' +
                  ((location.pathname === '/' || location.pathname === '/home')
                    ? 'text-neonlime-400'
                    : '')
                }
              />
              <span
                className={
                  (location.pathname === '/' || location.pathname === '/home')
                    ? 'text-neonlime-400 mt-1'
                    : 'mt-1'
                }
              >
                Home
              </span>
            </button>

            <button
              onClick={() => go('/buscar')}
              className="flex flex-col items-center hover:text-neonlime-400"
            >
              <IconSearch
                className={
                  'w-6 h-6 ' +
                  (isActive('/buscar') ? 'text-neonlime-400' : '')
                }
              />
              <span
                className={
                  isActive('/buscar') ? 'text-neonlime-400 mt-1' : 'mt-1'
                }
              >
                Buscar
              </span>
            </button>

            <button
              onClick={() => go('/empresas')}
              className="flex flex-col items-center hover:text-neonlime-400"
            >
              <IconUsers
                className={
                  'w-6 h-6 ' +
                  (isActive('/empresas') ? 'text-neonlime-400' : '')
                }
              />
              <span
                className={
                  isActive('/empresas') ? 'text-neonlime-400 mt-1' : 'mt-1'
                }
              >
                Empresas
              </span>
            </button>

            <button
              onClick={() => go('/vagas')}
              className="flex flex-col items-center hover:text-neonlime-400"
            >
              <IconBriefcase
                className={
                  'w-6 h-6 ' +
                  (isActive('/vagas') ? 'text-neonlime-400' : '')
                }
              />
              <span
                className={
                  isActive('/vagas') ? 'text-neonlime-400 mt-1' : 'mt-1'
                }
              >
                Vagas
              </span>
            </button>

            <button
              onClick={() => go('/chatbot')}
              className="flex flex-col items-center hover:text-neonlime-400"
            >
              <IconBot
                className={
                  'w-6 h-6 ' +
                  (isActive('/chatbot') ? 'text-neonlime-400' : '')
                }
              />
              <span
                className={
                  isActive('/chatbot') ? 'text-neonlime-400 mt-1' : 'mt-1'
                }
              >
                Chatbot
              </span>
            </button>

            <button
              onClick={() => go('/mensagens')}
              className="flex flex-col items-center hover:text-neonlime-400"
            >
              <IconChat
                className={
                  'w-6 h-6 ' +
                  (isActive('/mensagens') ? 'text-neonlime-400' : '')
                }
              />
              <span
                className={
                  isActive('/mensagens') ? 'text-neonlime-400 mt-1' : 'mt-1'
                }
              >
                Mensagens
              </span>
            </button>

            <button
              onClick={() => go('/network')}
              className="flex flex-col items-center hover:text-neonlime-400"
            >
              <IconUsers
                className={
                  'w-6 h-6 ' +
                  (isActive('/network') ? 'text-neonlime-400' : '')
                }
              />
              <span
                className={
                  isActive('/network') ? 'text-neonlime-400 mt-1' : 'mt-1'
                }
              >
                Network
              </span>
            </button>

            <button
              onClick={() => go('/perfil')}
              className="flex flex-col items-center hover:text-neonlime-400"
            >
              <IconUser
                className={
                  'w-6 h-6 ' +
                  (isActive('/perfil') ? 'text-neonlime-400' : '')
                }
              />
              <span
                className={
                  isActive('/perfil') ? 'text-neonlime-400 mt-1' : 'mt-1'
                }
              >
                Perfil
              </span>
            </button>
          
            <button
              onClick={() => {
                if (onOpenPublishModal) onOpenPublishModal();
              }}
              className="flex flex-col items-center hover:text-neonlime-400"
            >
              <span className="mt-1">Publicar</span>
            </button>
          </div>
        </nav>
      )}

      {/* Busca em telas pequenas */}
      <div className="sm:hidden px-4 pb-3">
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Buscar pessoas, skills ou áreas..."
          className="w-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-500"
        />
      </div>
    </header>
  );
}
