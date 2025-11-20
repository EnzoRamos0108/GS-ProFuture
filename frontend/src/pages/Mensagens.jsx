import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { useNetwork } from '../context/NetworkContext';

const API_URL = 'http://localhost:4000/api';

function Avatar({ nome, foto, size=28 }) {
  const fallback = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nome || 'U') + '&background=0f172a&color=facc15';
  return (
    <img
      src={foto || fallback}
      alt={nome || 'avatar'}
      className="rounded-full object-cover border border-slate-700"
      style={{ width: size, height: size }}
      onError={(e)=>{ e.currentTarget.src=fallback; }}
    />
  );
}

export default function Mensagens() {
  const { user } = useAuth();
  const location = useLocation();
  const { connections, followedCompanies } = useNetwork();
  const [lista, setLista] = useState([]);
  const [parceiro, setParceiro] = useState(null);
  const [thread, setThread] = useState([]);
  const [texto, setTexto] = useState('');
  const [arquivos, setArquivos] = useState([]);
  const [busca, setBusca] = useState('');
  const [sendError, setSendError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    if (user.tipoPerfil === 'empresa') {
      const list = (followedCompanies || []).map(e => ({ partnerType: 'empresa', partnerId: e.id, nome: e.nome, foto: e.logo }));
      setLista(list);
    } else {
      const list = (connections || []).map(c => ({ partnerType: 'profissional', partnerId: c.id, nome: c.nome, foto: c.foto }));
      setLista(list);
    }
  }, [user, connections, followedCompanies]);

  useEffect(() => {
    if (!location.state) return;
    const { partnerType, partnerId, nome, foto } = location.state || {};
    if (partnerType && partnerId) setParceiro({ partnerType, partnerId, nome, foto });
  }, [location.state]);

  async function loadThread(p) {
    const url = new URL(`${API_URL}/messages/thread`);
    url.searchParams.set('fromType', user.tipoPerfil);
    url.searchParams.set('fromId', user.id);
    url.searchParams.set('toType', p.partnerType);
    url.searchParams.set('toId', p.partnerId);
    const res = await fetch(url.toString());
    const data = await res.json();
    setThread(Array.isArray(data) ? data : []);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}), 0);
  }

  useEffect(() => {
    if (!user || !parceiro) return;
    loadThread(parceiro);
  }, [user, parceiro]);

  async function uploadOne(file) {
    const contentBase64 = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        const result = fr.result.split(',')[1];
        resolve(result);
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
    const body = { name: file.name, mime: file.type || 'application/octet-stream', contentBase64 };
    const res = await fetch(`${API_URL}/messages/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('upload falhou');
    return await res.json(); // { url, name, mime, size }
  }

  async function handleEnviar(e) { setSendError('');
    e.preventDefault();
    if ((!texto || !texto.trim()) && arquivos.length === 0) return;
    if (!user || !parceiro) return;

    let attachments = [];
    for (const f of arquivos) {
      const meta = await uploadOne(f);
      attachments.push(meta);
    }

    const body = {
      fromType: user.tipoPerfil,
      fromId: user.id,
      toType: parceiro.partnerType,
      toId: parceiro.partnerId,
      text: (texto || '').trim(),
      attachments
    };
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setTexto('');
      setArquivos([]);
      const msg = await res.json();
      setThread(prev => [...prev, msg]);
      setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:'smooth'}), 0);
    } else {
      const err = await res.json().catch(()=>({error:'Erro ao enviar'}));
      setSendError(err.error || 'Erro ao enviar');
    }
  }

  const listaFiltrada = useMemo(() => {
    if (!busca.trim()) return lista;
    const q = busca.toLowerCase();
    return lista.filter(c => (c.nome || (c.partnerType + '#' + c.partnerId)).toLowerCase().includes(q));
  }, [lista, busca]);

  function abrirConversa(c) {
    const p = { partnerType: c.partnerType, partnerId: c.partnerId, nome: c.nome, foto: c.foto };
    setParceiro(p);
  }

  return (
    <section className="max-w-5xl mx-auto px-4 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
        <div className="mb-2">
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar"
            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-3 py-2 text-xs"
          />
        </div>
        <div className="space-y-2 max-h-[65vh] overflow-y-auto">
          {listaFiltrada.map((c, idx) => (
            <button
              key={idx}
              onClick={() => abrirConversa(c)}
              className={"w-full text-left px-3 py-2 rounded-xl border text-xs flex items-center gap-2 " + (parceiro && c.partnerType===parceiro.partnerType && String(c.partnerId)===String(parceiro.partnerId)
                ? "border-neonlime-400 bg-neonlime-400/10"
                : "border-slate-200 dark:border-slate-700")}
            >
              <Avatar nome={c.nome} foto={c.foto} />
              <div className="flex-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {c.nome || (c.partnerType + ' #' + c.partnerId)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{c.partnerType}</div>
              </div>
            </button>
          ))}
          {listaFiltrada.length === 0 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Nenhum contato.</p>
          )}
        </div>
      </div>

      <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col">
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
          {parceiro ? (<>
            <Avatar nome={parceiro.nome || (parceiro.partnerType + '#' + parceiro.partnerId)} foto={parceiro.foto} size={22} />
            <span>Conversando com {parceiro.nome || (`${parceiro.partnerType} #${parceiro.partnerId}`)}</span>
          </>) : 'Selecione um contato'}
        </div>
        {sendError && (<div className='px-3 py-2 text-xs text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300'>{sendError}</div>)}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
          {thread.map(m => {
            const isMine = (m.fromType === user?.tipoPerfil && String(m.fromId) === String(user?.id));
            const showImage = (att) => att.mime && att.mime.startsWith('image/');
            return (
              <div key={m.id} className={'flex ' + (isMine ? 'justify-end' : 'justify-start')}>
                {!isMine && <div className="mr-2 self-end"><Avatar nome={parceiro?.nome} foto={parceiro?.foto} size={22} /></div>}
                <div className={'max-w-[75%] px-3 py-2 rounded-2xl text-xs ' + (isMine ? 'bg-neonlime-400 text-slate-900 rounded-br-sm' : 'bg-slate-800 text-white rounded-bl-sm')}>
                  {m.text && <div className="whitespace-pre-line">{m.text}</div>}
                  {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {m.attachments.map((a, i) => (
                        <div key={i}>
                          {showImage(a) ? (
                            <img src={a.url} alt={a.name} className="max-w-full rounded-lg border border-slate-700" />
                          ) : (
                            <a href={a.url} target="_blank" rel="noreferrer" className="underline">
                              {a.name || 'arquivo'} {a.size ? `(${Math.round(a.size/1024)} KB)` : ''}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-[10px] opacity-70 mt-1">{new Date(m.ts).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
          {thread.length === 0 && parceiro && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Sem mensagens ainda. Diga um oi! 👋</p>
          )}
        </div>
        <form onSubmit={handleEnviar} className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <input
            type="file"
            multiple
            onChange={e => setArquivos(Array.from(e.target.files || []))}
            className="text-[11px]"
          />
          <input
            type="text"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full px-3 py-2 text-xs"
          />
          <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-full bg-neonlime-400 text-slate-900 hover:bg-neonlime-300">
            Enviar
          </button>
        </form>
      </div>
    </section>
  );
}
