import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000/api';

export default function AssistantAI() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Olá! Eu sou o Assistente de Carreira do ProFuture. Me conte em que você quer focar hoje: upskilling, transição de carreira, análise de vagas ou plano de estudos?'
    }
  ]);

  const disabled = !user;

  async function handleSend(e) {
    e && e.preventDefault();
    if (!input.trim() || !user || loading) return;

    const content = input.trim();
    setInput('');

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: content
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch(API_URL + '/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          userId: user.id
        })
      });

      const data = await res.json();
      if (!res.ok || !data) {
        throw new Error(data && data.error ? data.error : 'Erro ao falar com o assistente.');
      }

      const replyText = data.reply || 'Não consegui gerar uma resposta agora. Tente novamente em alguns instantes.';

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: replyText
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          role: 'assistant',
          text: 'Ocorreu um erro ao se comunicar com o assistente de carreira. Verifique se o backend está rodando e se a GEMINI_API_KEY está configurada.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center justify-center rounded-full bg-neonlime-400 text-slate-900 shadow-lg hover:bg-neonlime-300 transition-colors px-4 py-3 text-sm font-semibold"
      >
        <span className="hidden sm:inline mr-2">Assistente de Carreira</span>
        <span className="sm:hidden">IA</span>
      </button>

      {/* Janela de chat */}
      {open && (
        <div className="fixed bottom-20 right-4 z-40 w-full max-w-sm sm:max-w-md">
          <div className="bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[420px]">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Assistente de Carreira ProFuture</h2>
                <p className="text-[11px] text-slate-400">
                  Upskilling, reskilling, trilhas de estudo e análise de vagas em tempo real.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Corpo do chat */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
              {!user && (
                <div className="text-xs text-amber-300 bg-amber-900/40 border border-amber-700 rounded-lg px-3 py-2">
                  Faça login para que o assistente consiga usar seus dados de perfil e hard skills nas recomendações.
                </div>
              )}

              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={
                    msg.role === 'user'
                      ? 'flex justify-end'
                      : 'flex justify-start'
                  }
                >
                  <div
                    className={
                      msg.role === 'user'
                        ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-neonlime-400 text-slate-900 px-3 py-2 text-xs whitespace-pre-wrap'
                        : 'max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-800 text-slate-100 px-3 py-2 text-xs whitespace-pre-wrap'
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="text-[11px] text-slate-400">
                  O assistente está analisando seu perfil, skills e vagas cadastradas...
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-slate-700 px-3 py-2 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={disabled}
                placeholder={
                  disabled
                    ? 'Faça login para conversar com o assistente...'
                    : 'Digite sua dúvida de carreira...'
                }
                className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-neonlime-400"
              />
              <button
                type="submit"
                disabled={disabled || loading || !input.trim()}
                className="inline-flex items-center justify-center px-3 py-2 rounded-full text-[11px] font-semibold bg-neonlime-400 text-slate-900 hover:bg-neonlime-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
