import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import escuroLogo from '../assets/escuroLogo_.png';

export default function LoginRegister() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [profileType, setProfileType] = useState('profissional');

  // Quiz ODS
  const [quizOds4, setQuizOds4] = useState(7);
  const [quizOds8, setQuizOds8] = useState(7);
  const [quizOds9, setQuizOds9] = useState(7);
  const [quizOds10, setQuizOds10] = useState(7);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      if (tab === 'login') {
        await login(email, senha);
      } else {
        const radar =
          profileType === 'profissional'
            ? {
                ods4: quizOds4,
                ods8: quizOds8,
                ods9: quizOds9,
                ods10: quizOds10,
              }
            : undefined;
        await register(nome, email, senha, profileType, radar);
      }
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Credenciais inválidas');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 px-4">
      <div className="w-full max-w-xl">
        {/* Logo + texto centralizados */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={escuroLogo}
            alt="ProFuture"
            className="h-16 w-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-1">ProFuture</h1>
          <p className="text-sm text-slate-300 max-w-md">
            Conecte pessoas, competências e propósito por meio da tecnologia.
          </p>
        </div>

        {/* Card de login / registro centralizado */}
        <div className="bg-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-700/80">
          <div className="flex mb-4 rounded-lg bg-slate-900/60 p-1">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={
                'flex-1 py-1.5 text-sm rounded-md ' +
                (tab === 'login'
                  ? 'bg-slate-900 text-neonlime-400'
                  : 'text-slate-400')
              }
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={
                'flex-1 py-1.5 text-sm rounded-md ' +
                (tab === 'register'
                  ? 'bg-slate-900 text-neonlime-400'
                  : 'text-slate-400')
              }
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="mb-3 text-xs text-red-400 bg-red-950/40 border border-red-500/50 rounded p-2">
              {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            {tab === 'register' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required={tab === 'register'}
                />
              </div>
            )}

            {tab === 'register' && (
              <div>
                <p className="block text-xs text-slate-400 mb-1">
                  Tipo de perfil
                </p>
                <div className="flex gap-4 text-xs">
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="tipoPerfil"
                      value="profissional"
                      className="accent-neonlime-400"
                      checked={profileType === 'profissional'}
                      onChange={() => setProfileType('profissional')}
                    />
                    <span>Perfil profissional</span>
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="tipoPerfil"
                      value="empresa"
                      className="accent-neonlime-400"
                      checked={profileType === 'empresa'}
                      onChange={() => setProfileType('empresa')}
                    />
                    <span>Perfil de empresa</span>
                  </label>
                </div>
              </div>
            )}

            {tab === 'register' && profileType === 'profissional' && (
              <div className="mt-1 rounded-xl border border-slate-700 bg-slate-900/60 p-3 space-y-3">
                <p className="text-[11px] text-slate-300">
                  Antes de entrar, queremos entender com quais ODSs você mais se conecta.
                  Suas respostas vão ajustar o seu{' '}
                  <strong>Radar de Propósito &amp; Futuro</strong> no perfil.
                </p>

                <div className="space-y-2">
                  <div>
                    <p className="text-[11px] text-slate-200 mb-1">
                      O quanto você se identifica com educação, ensino ou mentoria?
                      <br />
                      <span className="text-[10px] text-slate-400">
                        (ODS 4: Educação de Qualidade)
                      </span>
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={quizOds4}
                      onChange={e => setQuizOds4(Number(e.target.value))}
                      className="w-full accent-neonlime-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Baixa conexão</span>
                      <span>Alta conexão ({quizOds4})</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-200 mb-1">
                      O quanto você busca trabalho com propósito, equilíbrio e crescimento?
                      <br />
                      <span className="text-[10px] text-slate-400">
                        (ODS 8: Trabalho Decente e Crescimento)
                      </span>
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={quizOds8}
                      onChange={e => setQuizOds8(Number(e.target.value))}
                      className="w-full accent-neonlime-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Baixa conexão</span>
                      <span>Alta conexão ({quizOds8})</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-200 mb-1">
                      O quanto você se interessa por tecnologia, inovação e construção de soluções digitais?
                      <br />
                      <span className="text-[10px] text-slate-400">
                        (ODS 9: Indústria, Inovação e Infraestrutura)
                      </span>
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={quizOds9}
                      onChange={e => setQuizOds9(Number(e.target.value))}
                      className="w-full accent-neonlime-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Baixa conexão</span>
                      <span>Alta conexão ({quizOds9})</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-200 mb-1">
                      O quanto você quer gerar impacto social, inclusão e redução de desigualdades?
                      <br />
                      <span className="text-[10px] text-slate-400">
                        (ODS 10: Redução das Desigualdades)
                      </span>
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={quizOds10}
                      onChange={e => setQuizOds10(Number(e.target.value))}
                      className="w-full accent-neonlime-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Baixa conexão</span>
                      <span>Alta conexão ({quizOds10})</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400">
                  Você poderá ajustar esses valores depois, editando o seu perfil.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input
                type="email"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Senha</label>
              <input
                type="password"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2 rounded-lg bg-neonlime-400 text-slate-900 font-semibold text-sm"
            >
              {tab === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
